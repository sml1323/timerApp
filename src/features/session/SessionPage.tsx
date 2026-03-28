import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import type { SessionPhaseType } from '../../domain/sessions/session';
import { useSessionStore } from './state/sessionStore';
import { useSessionPhase, useActiveSession, useSelectedTopic, useCompletedSession } from './state/sessionSelectors';
import { useSessionClock } from './hooks/useSessionClock';
import { FloatingTimerWidget } from './components/FloatingTimerWidget';
import { SessionOutcomePanel } from './components/SessionOutcomePanel';
import { getOutcomeContent, getInterruptedOutcomeContent, getPhaseStartErrorMessage } from './session-flow';
import {
  beginBreakSession,
  beginStudySession,
  completeActiveSession,
  interruptActiveSession,
} from './session-service';
import { syncTraySessionTimerText } from '../../platform/tauri/tray-client';
import { Button } from '../../shared/ui/Button/Button';
import styles from './SessionPage.module.css';

export function SessionPage() {
  const navigate = useNavigate();
  const activeSession = useActiveSession();
  const sessionPhase = useSessionPhase();
  const selectedTopic = useSelectedTopic();
  const completedSession = useCompletedSession();
  const reset = useSessionStore((state) => state.reset);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const selectedTopicId = selectedTopic.id;
  const selectedTopicName = selectedTopic.name;

  // 세션이 없는 상태로 직접 접근 시 홈으로 리다이렉트
  useEffect(() => {
    if (!activeSession && sessionPhase === 'idle') {
      navigate('/', { replace: true });
    }
  }, [activeSession, sessionPhase, navigate]);

  const handleComplete = useCallback(async () => {
    if (!activeSession) return;
    setActionError(null);
    setIsSaving(true);

    try {
      const result = await completeActiveSession(activeSession.id);
      if (!result.ok) {
        setActionError(result.message);
      }
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
      if (!result.ok) {
        setActionError(result.message);
      }
    } catch {
      setActionError('세션 종료 중 예기치 않은 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [activeSession]);

  const transitionToPhase = useCallback(async (nextPhaseType: SessionPhaseType) => {
    const topicId = selectedTopicId ?? completedSession?.topicId ?? activeSession?.topicId;
    if (!topicId) {
      setActionError('다음 세션에 사용할 주제가 없습니다.');
      return;
    }

    setActionError(null);
    setIsSaving(true);

    try {
      const result = nextPhaseType === 'break'
        ? await beginBreakSession(topicId, selectedTopicName ?? null)
        : await beginStudySession(topicId, selectedTopicName ?? null);

      if (!result.ok) {
        setActionError(result.message);
      }
    } catch {
      setActionError(getPhaseStartErrorMessage(nextPhaseType));
    } finally {
      setIsSaving(false);
    }
  }, [
    activeSession?.topicId,
    completedSession?.topicId,
    selectedTopicId,
    selectedTopicName,
  ]);

  const handleGoHome = useCallback(() => {
    reset();
    navigate('/', { replace: true });
  }, [reset, navigate]);

  const handleStartBreak = useCallback(() => {
    void transitionToPhase('break');
  }, [transitionToPhase]);

  const handleStartNextStudy = useCallback(() => {
    void transitionToPhase('study');
  }, [transitionToPhase]);

  const handleViewStats = useCallback(() => {
    reset();
    navigate('/stats', { replace: true });
  }, [reset, navigate]);

  const clock = useSessionClock({
    startedAtMs: activeSession?.startedAtMs ?? Date.now(),
    plannedDurationSec: activeSession?.plannedDurationSec ?? 0,
    isRunning: sessionPhase === 'running',
    onComplete: handleComplete,
  });

  useEffect(() => {
    void syncTraySessionTimerText(sessionPhase === 'running' ? clock.formattedTime : null);
  }, [clock.formattedTime, sessionPhase]);

  useEffect(() => () => {
    void syncTraySessionTimerText(null);
  }, []);

  // 세션이 없으면 아무것도 렌더링하지 않음 (리다이렉트 대기)
  if (!activeSession && sessionPhase === 'idle') {
    return null;
  }

  // 세션 완료 상태 — SessionOutcomePanel 표시
  if (sessionPhase === 'completed') {
    const completedPhaseType = completedSession?.phaseType ?? activeSession?.phaseType ?? 'study';
    const outcomeContent = getOutcomeContent(completedPhaseType);
    const actualDurationSec = (() => {
      if (completedSession?.endedAtMs && completedSession.startedAtMs) {
        return Math.floor((completedSession.endedAtMs - completedSession.startedAtMs) / 1000);
      }
      return activeSession?.plannedDurationSec ?? 0;
    })();
    const handlePrimaryAction = outcomeContent.nextPhaseType === 'break'
      ? handleStartBreak
      : handleStartNextStudy;

    return (
      <div className={styles.page}>
        <SessionOutcomePanel
          variant="success"
          topicName={selectedTopicName ?? ''}
          durationSec={actualDurationSec}
          durationLabel={outcomeContent.durationLabel}
          feedbackMessage={outcomeContent.feedbackMessage}
          primaryActionLabel={outcomeContent.primaryActionLabel}
          onPrimaryAction={handlePrimaryAction}
          onViewStats={handleViewStats}
          onGoHome={handleGoHome}
          isBusy={isSaving}
        />
        {actionError && (
          <p className={styles.actionError} role="alert">
            {actionError}
          </p>
        )}
      </div>
    );
  }

  // 세션 중단 상태 — recovery variant SessionOutcomePanel
  if (sessionPhase === 'interrupted') {
    const interruptedContent = getInterruptedOutcomeContent();
    const interruptedDurationSec = (() => {
      const session = completedSession ?? activeSession;
      if (session?.endedAtMs && session.startedAtMs) {
        return Math.floor((session.endedAtMs - session.startedAtMs) / 1000);
      }
      return activeSession?.plannedDurationSec ?? 0;
    })();

    return (
      <div className={styles.page}>
        <SessionOutcomePanel
          variant="recovery"
          topicName={selectedTopicName ?? ''}
          durationSec={interruptedDurationSec}
          durationLabel="interrupted"
          feedbackMessage={interruptedContent.feedbackMessage}
          primaryActionLabel={interruptedContent.primaryActionLabel}
          onPrimaryAction={handleStartNextStudy}
          onViewStats={handleViewStats}
          onGoHome={handleGoHome}
          isBusy={isSaving}
          recoveryHint={interruptedContent.recoveryHint}
          onSelectOtherTopic={handleGoHome}
        />
        {actionError && (
          <p className={styles.actionError} role="alert">
            {actionError}
          </p>
        )}
      </div>
    );
  }

  // 세션 진행 중 — 플로팅 위젯
  return (
    <>
      <FloatingTimerWidget
        phaseType={activeSession?.phaseType ?? 'study'}
        formattedTime={clock.formattedTime}
        progressPercent={clock.progressPercent}
        topicName={selectedTopicName ?? ''}
        isRunning={sessionPhase === 'running'}
        onInterrupt={handleInterrupt}
        onViewStats={handleViewStats}
        onGoHome={handleGoHome}
        onClose={handleGoHome}
        isBusy={isSaving}
      />
      {actionError && (
        <div className={styles.page}>
          <p className={styles.actionError} role="alert">
            {actionError}
          </p>
          {clock.remainingSec === 0 && sessionPhase === 'running' && (
            <Button
              variant="secondary"
              onClick={handleComplete}
              disabled={isSaving}
            >
              저장 재시도
            </Button>
          )}
        </div>
      )}
    </>
  );
}
