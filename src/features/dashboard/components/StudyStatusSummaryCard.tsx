import { useNavigate } from 'react-router';
import type { DashboardData } from '../dashboard-service';
import defaultCharacter from '../../../assets/characters/default.svg';
import styles from './StudyStatusSummaryCard.module.css';

interface StudyStatusSummaryCardProps {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getProgressState(percent: number): 'default' | 'nearing' | 'achieved' {
  if (percent >= 100) return 'achieved';
  if (percent >= 80) return 'nearing';
  return 'default';
}

function getProgressLabel(state: 'default' | 'nearing' | 'achieved'): string {
  switch (state) {
    case 'achieved': return '🎉 목표 달성!';
    case 'nearing': return '거의 다 왔어요!';
    default: return '';
  }
}

export function StudyStatusSummaryCard({ data, isLoading, error }: StudyStatusSummaryCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/stats');
  };

  if (error) {
    return (
      <div className={styles.card} role="region" aria-label="학습 현황 요약">
        <p className={styles.errorText}>데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className={styles.card} role="region" aria-label="학습 현황 요약">
        <div className={styles.skeleton} aria-busy="true" aria-label="로딩 중" />
      </div>
    );
  }

  // 데이터 없음 상태
  if (!data.hasData) {
    return (
      <button
        type="button"
        className={styles.card}
        aria-label="학습 현황 요약"
        onClick={handleCardClick}
      >
        <div className={styles.emptyState}>
          <img src={defaultCharacter} alt="" aria-hidden="true" className={styles.character} />
          <p className={styles.emptyMessage}>아직 학습 기록이 없어요</p>
          <p className={styles.emptyHint}>주제를 선택하고 학습을 시작해보세요!</p>
        </div>
      </button>
    );
  }

  const progressState = data.goalCount > 0 ? getProgressState(data.weeklyProgressPercent) : null;
  const progressLabel = progressState ? getProgressLabel(progressState) : '';
  const clampedPercent = Math.min(data.weeklyProgressPercent, 100);

  return (
    <button
      type="button"
      className={styles.card}
      aria-label="학습 현황 요약"
      onClick={handleCardClick}
    >
      <div className={styles.cardContent}>
        <div className={styles.statsArea}>
          {/* 오늘 누적 시간 */}
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>오늘</span>
            <span className={styles.statValue} aria-label={`오늘 학습 시간 ${formatMinutes(data.todayMinutes)}`}>
              {formatMinutes(data.todayMinutes)}
            </span>
            <span className={styles.statSub}>{data.todaySessionCount}회 세션</span>
          </div>

          {/* 이번 주 누적 시간 */}
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>이번 주</span>
            <span className={styles.statValue} aria-label={`이번 주 학습 시간 ${formatMinutes(data.weeklyMinutes)}`}>
              {formatMinutes(data.weeklyMinutes)}
            </span>
            <span className={styles.statSub}>{data.weeklySessionCount}회 세션</span>
          </div>
        </div>

        {/* 목표 진행률 */}
        {data.goalCount > 0 ? (
          <div className={styles.goalArea}>
            <div className={styles.goalHeader}>
              <span className={styles.goalTitle}>주간 목표</span>
              <span
                className={styles.goalPercent}
                aria-label={`목표 진행률 ${data.weeklyProgressPercent}%`}
                data-state={progressState}
              >
                {data.weeklyProgressPercent}%
              </span>
            </div>

            {/* 프로그레스바 */}
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuenow={data.weeklyProgressPercent}
              aria-valuemin={0}
              aria-valuemax={Math.max(100, data.weeklyProgressPercent)}
              aria-label={`주간 목표 진행률 ${data.weeklyProgressPercent}%`}
            >
              <div
                className={styles.progressFill}
                style={{ width: `${clampedPercent}%` }}
                data-state={progressState}
              />
            </div>

            {/* 진행 상태 텍스트 */}
            <div className={styles.goalDetails}>
              {progressState === 'achieved' ? (
                <span className={styles.achievedLabel}>{progressLabel}</span>
              ) : (
                <>
                  {progressLabel && (
                    <span className={styles.nearingLabel}>{progressLabel}</span>
                  )}
                  <span
                    className={styles.remainingText}
                    aria-label={`남은 목표 ${formatMinutes(data.remainingMinutes)}`}
                  >
                    남은 목표: {formatMinutes(data.remainingMinutes)}
                  </span>
                </>
              )}
              <span className={styles.goalCount}>
                {data.goalCount}개 목표 중 {data.achievedGoalCount}개 달성
              </span>
            </div>
          </div>
        ) : (
          <div className={styles.noGoalArea}>
            <p className={styles.noGoalText}>주간 목표를 설정하면 진행 상황을 확인할 수 있어요</p>
          </div>
        )}

        {/* 캐릭터 (보조 요소) */}
        <div className={styles.characterArea}>
          <img src={defaultCharacter} alt="" aria-hidden="true" className={styles.character} />
        </div>
      </div>
    </button>
  );
}
