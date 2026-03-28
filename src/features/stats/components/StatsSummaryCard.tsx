import type { TodayStudySummary, WeeklyStudySummary } from '../../../domain/statistics/statistics';
import styles from './StatsSummaryCard.module.css';

interface StatsSummaryCardProps {
  today: TodayStudySummary;
  weekly: WeeklyStudySummary;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

export function StatsSummaryCard({ today, weekly }: StatsSummaryCardProps) {
  return (
    <div className={styles.card} role="region" aria-label="학습 요약">
      <div className={styles.cardContent}>
        <div className={styles.statsArea}>
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>오늘</span>
            <span
              className={styles.statValue}
              aria-label={`오늘 학습 시간 ${formatMinutes(today.totalMinutes)}`}
            >
              {formatMinutes(today.totalMinutes)}
            </span>
            <span className={styles.statSub}>{today.sessionCount}개 세션</span>
          </div>

          <div className={styles.statBlock}>
            <span className={styles.statLabel}>이번 주</span>
            <span
              className={styles.statValue}
              aria-label={`이번 주 학습 시간 ${formatMinutes(weekly.totalMinutes)}`}
            >
              {formatMinutes(weekly.totalMinutes)}
            </span>
            <span className={styles.statSub}>{weekly.sessionCount}개 세션</span>
          </div>
        </div>
      </div>
    </div>
  );
}
