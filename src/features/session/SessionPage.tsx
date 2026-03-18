import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSessionStore } from './state/sessionStore';
import { useSessionPhase, useActiveSession, useSelectedTopic } from './state/sessionSelectors';
import { useSessionClock } from './hooks/useSessionClock';
import { SessionFocusTimer } from './components/SessionFocusTimer';
import { CharacterStatePanel } from './components/CharacterStatePanel';
import { completeStudySession, interruptStudySession } from './session-service';
import { Button } from '../../shared/ui/Button/Button';
import styles from './SessionPage.module.css';

export function SessionPage() {
  const navigate = useNavigate();
  const activeSession = useActiveSession();
  const sessionPhase = useSessionPhase();
  const selectedTopic = useSelectedTopic();
  const reset = useSessionStore((state) => state.reset);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      const result = await completeStudySession(activeSession.id);
      if (!result.ok) {
        setActionError(result.message);
      }
    } catch {
      setActionError('세션 완료 저장 중 예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [activeSession]);

  const handleInterrupt = useCallback(async () => {
    if (!activeSession) return;
    setActionError(null);
    setIsSaving(true);

    try {
      const result = await interruptStudySession(activeSession.id);
      if (!result.ok) {
        setActionError(result.message);
      }
    } catch {
      setActionError('세션 중단 처리 중 예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [activeSession]);

  const handleGoHome = useCallback(() => {
    reset();
    navigate('/', { replace: true });
  }, [reset, navigate]);

  const clock = useSessionClock({
    startedAtMs: activeSession?.startedAtMs ?? Date.now(),
    plannedDurationSec: activeSession?.plannedDurationSec ?? 0,
    isRunning: sessionPhase === 'running',
    onComplete: handleComplete,
  });

  // 세션이 없으면 아무것도 렌더링하지 않음 (리다이렉트 대기)
  if (!activeSession && sessionPhase === 'idle') {
    return null;
  }

  // 세션 완료/중단 상태
  if (sessionPhase === 'completed' || sessionPhase === 'interrupted') {
    const message =
      sessionPhase === 'completed'
        ? '세션이 완료되었습니다.'
        : '세션이 중단되었습니다';

    return (
      <div className={styles.page}>
        <div className={styles.endState}>
          <CharacterStatePanel state="default" message={message} />
          <p className={styles.endMessage}>{message}</p>
          <button
            className={styles.homeButton}
            onClick={handleGoHome}
            type="button"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 세션 진행 중
  return (
    <div className={styles.page}>
      <SessionFocusTimer
        formattedTime={clock.formattedTime}
        progressPercent={clock.progressPercent}
        topicName={selectedTopic.name ?? ''}
        remainingSec={clock.remainingSec}
        onInterrupt={handleInterrupt}
        isBusy={isSaving}
      />
      <CharacterStatePanel state="loading" />
      {actionError && (
        <p className={styles.actionError} role="alert">
          {actionError}
        </p>
      )}
      {clock.remainingSec === 0 && sessionPhase === 'running' && actionError && (
        <Button
          variant="secondary"
          onClick={handleComplete}
          disabled={isSaving}
        >
          완료 저장 다시 시도
        </Button>
      )}
    </div>
  );
}
