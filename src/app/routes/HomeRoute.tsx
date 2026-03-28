import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTopicSelect } from '../../features/session/hooks/useTopicSelect';
import { useGoalProgress } from '../../features/goals/hooks/useGoalProgress';
import { useDashboardData } from '../../features/dashboard/hooks/useDashboardData';
import { beginStudySession } from '../../features/session/session-service';
import { useSessionStore } from '../../features/session/state/sessionStore';
import styles from './HomeRoute.module.css';

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

export function HomeRoute() {
  const navigate = useNavigate();
  const { topics, isLoading, error, selectedTopicId, selectTopic, isReady } = useTopicSelect();
  const activeSession = useSessionStore((state) => state.activeSession);
  const sessionPhase = useSessionStore((state) => state.sessionPhase);
  const { progressList } = useGoalProgress();
  const { data: dashboardData } = useDashboardData();

  const achievedCount = progressList.filter((p) => p.isAchieved).length;
  const totalGoalCount = progressList.length;

  const weeklyMinutes = dashboardData?.weeklyMinutes ?? 0;

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
      setStartError('세션을 시작하는 중 오류가 발생했습니다.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <section className={styles.homePage}>
      {/* Hero: Weekly goal progress */}
      <div className={styles.heroSection}>
        <span className={styles.heroLabel}>이번 주 학습</span>
        <span className={styles.heroNumber}>{formatMinutes(weeklyMinutes)}</span>
        {totalGoalCount > 0 && (
          <span className={styles.heroSub}>
            {achievedCount}/{totalGoalCount} 목표 달성
          </span>
        )}
      </div>

      {/* Resume notice */}
      {hasRunningSession && (
        <div className={styles.resumeNotice}>
          <span className={styles.resumeMessage}>진행 중인 세션이 있습니다</span>
          <button
            type="button"
            className={styles.resumeButton}
            onClick={handleResumeSession}
          >
            돌아가기
          </button>
        </div>
      )}

      {/* Topic chips */}
      <div className={styles.chipSection}>
        <span className={styles.chipLabel}>주제 선택</span>
        {isLoading && <p className={styles.loadingText}>불러오는 중...</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {!isLoading && !error && topics.length === 0 && (
          <p className={styles.emptyText}>아직 주제가 없습니다. 주제를 먼저 추가해주세요.</p>
        )}
        {topics.length > 0 && (
          <div className={styles.chipWrap} role="listbox" aria-label="주제 선택">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                role="option"
                aria-selected={topic.id === selectedTopicId}
                className={`${styles.chip} ${topic.id === selectedTopicId ? styles.chipSelected : ''}`}
                onClick={() => selectTopic(topic.id)}
              >
                {topic.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Start CTA */}
      {startError && (
        <p role="alert" className={styles.errorMessage}>
          {startError}
        </p>
      )}
      <button
        type="button"
        className={styles.startButton}
        disabled={!isReady || isStarting || hasRunningSession}
        onClick={handleStartSession}
      >
        <svg
          className={styles.playIcon}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        {isStarting ? '시작하는 중...' : '시작'}
      </button>
    </section>
  );
}
