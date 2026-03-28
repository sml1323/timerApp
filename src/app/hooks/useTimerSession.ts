import { useEffect, useCallback, useState } from 'react';
import type { SessionPhaseType } from '../../domain/sessions/session';
import { useSessionStore } from '../../features/session/state/sessionStore';
import {
  useActiveSession,
  useSessionPhase,
  useSelectedTopic,
  useCompletedSession,
} from '../../features/session/state/sessionSelectors';
import { useSessionClock } from '../../features/session/hooks/useSessionClock';
import {
  beginStudySession,
  beginBreakSession,
  completeActiveSession,
  interruptActiveSession,
} from '../../features/session/session-service';
import { interruptSession as interruptSessionRecordOnly } from '../../platform/browser/session-adapter';
import {
  getOutcomeContent,
  getInterruptedOutcomeContent,
  getPhaseStartErrorMessage,
} from '../../features/session/session-flow';
import { syncTraySessionTimerText } from '../../platform/tauri/tray-client';

export function useTimerSession() {
  const activeSession = useActiveSession();
  const sessionPhase = useSessionPhase();
  const selectedTopic = useSelectedTopic();
  const completedSession = useCompletedSession();
  const clearSession = useSessionStore((s) => s.clearSession);

  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [paused, setPaused] = useState(false);

  const handleComplete = useCallback(async () => {
    if (!activeSession) return;
    setActionError(null);
    setIsSaving(true);
    try {
      const result = await completeActiveSession(activeSession.id);
      if (!result.ok) setActionError(result.message);
    } catch {
      setActionError('세션 저장 중 예기치 않은 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [activeSession]);

  const handleInterrupt = useCallback(async () => {
    if (!activeSession) return;
    setActionError(null);
    setIsSaving(true);
    try {
      const result = await interruptActiveSession(activeSession.id);
      if (!result.ok) setActionError(result.message);
    } catch {
      setActionError('세션 종료 중 예기치 않은 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [activeSession]);

  const handleStart = useCallback(async (topicId: string, topicName: string) => {
    setActionError(null);
    setIsSaving(true);
    try {
      const result = await beginStudySession(topicId, topicName);
      if (!result.ok) setActionError(result.message);
    } catch {
      setActionError('세션을 시작하는 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const transitionToPhase = useCallback(async (nextPhaseType: SessionPhaseType) => {
    const topicId = selectedTopic.id ?? completedSession?.topicId ?? activeSession?.topicId;
    const topicName = selectedTopic.name ?? null;
    if (!topicId) {
      setActionError('다음 세션에 사용할 주제가 없습니다.');
      return;
    }
    setActionError(null);
    setIsSaving(true);
    try {
      const result = nextPhaseType === 'break'
        ? await beginBreakSession(topicId, topicName)
        : await beginStudySession(topicId, topicName);
      if (!result.ok) setActionError(result.message);
    } catch {
      setActionError(getPhaseStartErrorMessage(nextPhaseType));
    } finally {
      setIsSaving(false);
    }
  }, [activeSession?.topicId, completedSession?.topicId, selectedTopic.id, selectedTopic.name]);

  const handleGoHome = useCallback(async () => {
    if (activeSession && sessionPhase === 'running') {
      await interruptActiveSession(activeSession.id);
    }
    clearSession();
  }, [activeSession, sessionPhase, clearSession]);

  const handleReset = useCallback(async () => {
    if (!activeSession) return;
    setActionError(null);
    setIsSaving(true);
    try {
      // DB만 interrupt, store 업데이트 안 함 (플래시 방지)
      await interruptSessionRecordOnly({ sessionId: activeSession.id });
      const topicId = selectedTopic.id ?? activeSession.topicId;
      const topicName = selectedTopic.name ?? null;
      if (topicId) {
        const result = await beginStudySession(topicId, topicName);
        if (!result.ok) setActionError(result.message);
        else setPaused(true); // 리셋 후 일시정지 상태로 시작
      }
    } catch {
      setActionError('세션 초기화 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [activeSession, selectedTopic.id, selectedTopic.name]);

  const togglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  const handleStartBreak = useCallback(() => {
    void transitionToPhase('break');
  }, [transitionToPhase]);

  const handleStartNextStudy = useCallback(() => {
    void transitionToPhase('study');
  }, [transitionToPhase]);

  const clockRunning = sessionPhase === 'running' && !paused;

  const clock = useSessionClock({
    startedAtMs: activeSession?.startedAtMs ?? Date.now(),
    plannedDurationSec: activeSession?.plannedDurationSec ?? 0,
    isRunning: clockRunning,
    onComplete: handleComplete,
  });

  // Tray sync
  useEffect(() => {
    void syncTraySessionTimerText(sessionPhase === 'running' ? clock.formattedTime : null);
  }, [clock.formattedTime, sessionPhase]);

  useEffect(() => () => {
    void syncTraySessionTimerText(null);
  }, []);

  const outcomeContent = sessionPhase === 'completed'
    ? getOutcomeContent(completedSession?.phaseType ?? activeSession?.phaseType ?? 'study')
    : sessionPhase === 'interrupted'
      ? getInterruptedOutcomeContent()
      : null;

  const actualDurationSec = (() => {
    if (completedSession?.endedAtMs && completedSession.startedAtMs) {
      return Math.floor((completedSession.endedAtMs - completedSession.startedAtMs) / 1000);
    }
    return activeSession?.plannedDurationSec ?? 0;
  })();

  return {
    sessionPhase,
    activeSession,
    selectedTopic,
    completedSession,
    clock,
    paused,
    actionError,
    isSaving,
    outcomeContent,
    actualDurationSec,
    handlers: {
      handleStart,
      handleComplete,
      handleInterrupt,
      handleGoHome,
      handleReset,
      togglePause,
      handleStartBreak,
      handleStartNextStudy,
    },
  };
}
