import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TopicQuickSelectPanel } from '../../features/session/components/TopicQuickSelectPanel';
import { useTopicSelect } from '../../features/session/hooks/useTopicSelect';
import { beginStudySession } from '../../features/session/session-service';
import { useSessionStore } from '../../features/session/state/sessionStore';
import { Button } from '../../shared/ui/Button/Button';
import styles from './HomeRoute.module.css';

export function HomeRoute() {
  const navigate = useNavigate();
  const { topics, isLoading, error, selectedTopicId, selectTopic, isReady } = useTopicSelect();
  const activeSession = useSessionStore((state) => state.activeSession);
  const sessionPhase = useSessionStore((state) => state.sessionPhase);

  const [startError, setStartError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const hasRunningSession = sessionPhase === 'running' && activeSession !== null;

  const handleResumeSession = () => {
    navigate('/session');
  };

  const handleStartSession = async () => {
    if (hasRunningSession) {
      navigate('/session');
      return;
    }

    if (!selectedTopicId) return;

    setStartError(null);
    setIsStarting(true);

    try {
      const selectedTopic = topics.find((t) => t.id === selectedTopicId);
      const result = await beginStudySession(selectedTopicId, selectedTopic?.name ?? '');

      if (result.ok) {
        navigate('/session');
      } else {
        setStartError(result.message);
      }
    } catch {
      setStartError('세션 시작 중 예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <section className={styles.homePage}>
      <h1>홈</h1>
      {/* Study Status Summary Card → Story 5.2에서 구현 */}
      <section aria-label="주제 선택 및 세션 시작" className={styles.quickStartSection}>
        <h2>학습 시작</h2>
        {hasRunningSession && (
          <div className={styles.resumeNotice}>
            <p className={styles.resumeMessage}>이미 진행 중인 세션이 있습니다.</p>
            <Button variant="secondary" onClick={handleResumeSession}>
              세션으로 돌아가기
            </Button>
          </div>
        )}
        <TopicQuickSelectPanel
          topics={topics}
          isLoading={isLoading}
          error={error}
          selectedTopicId={selectedTopicId}
          onSelectTopic={selectTopic}
        />
        {startError && (
          <p role="alert" className={styles.errorMessage}>
            {startError}
          </p>
        )}
        <Button
          variant="primary"
          disabled={!isReady || isStarting || hasRunningSession}
          onClick={handleStartSession}
        >
          {isStarting ? '시작 중...' : '학습 시작'}
        </Button>
      </section>
    </section>
  );
}
