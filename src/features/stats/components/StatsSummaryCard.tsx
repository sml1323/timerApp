import type { TodayStudySummary, WeeklyStudySummary } from '../../../domain/statistics/statistics';
import defaultCharacter from '../../../assets/characters/default.svg';
import styles from './StatsSummaryCard.module.css';

interface StatsSummaryCardProps {
  today: TodayStudySummary;
  weekly: WeeklyStudySummary;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function StatsSummaryCard({ today, weekly }: StatsSummaryCardProps) {
  return (
    <div className={styles.card} role="region" aria-label="학습 요약">
      <div className={styles.cardContent}>
        <div className={styles.statsArea}>
          {/* 오늘 요약 */}
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>오늘</span>
            <span
              className={styles.statValue}
              aria-label={`오늘 학습 시간 ${formatMinutes(today.totalMinutes)}`}
            >
              {formatMinutes(today.totalMinutes)}
            </span>
            <span className={styles.statSub}>{today.sessionCount}회 세션</span>
          </div>

          {/* 이번 주 요약 */}
          <div className={styles.statBlock}>
            <span className={styles.statLabel}>이번 주</span>
            <span
              className={styles.statValue}
              aria-label={`이번 주 학습 시간 ${formatMinutes(weekly.totalMinutes)}`}
            >
              {formatMinutes(weekly.totalMinutes)}
            </span>
            <span className={styles.statSub}>{weekly.sessionCount}회 세션</span>
          </div>
        </div>

        {/* 캐릭터 (보조 요소) */}
        <div className={styles.characterArea}>
          <img src={defaultCharacter} alt="" aria-hidden="true" className={styles.character} />
        </div>
      </div>
    </div>
  );
}
