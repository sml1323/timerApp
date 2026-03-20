import type { TopicStudySummary } from '../../../domain/statistics/statistics';
import defaultCharacter from '../../../assets/characters/default.svg';
import styles from './TopicBreakdownList.module.css';

interface TopicBreakdownListProps {
  topics: TopicStudySummary[];
  totalMinutes: number;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function TopicBreakdownList({ topics, totalMinutes }: TopicBreakdownListProps) {
  if (topics.length === 0) {
    return (
      <div className={styles.emptyState} role="region" aria-label="주제별 학습 시간">
        <img src={defaultCharacter} alt="" aria-hidden="true" className={styles.emptyCharacter} />
        <p className={styles.emptyMessage}>아직 학습 기록이 없어요</p>
        <p className={styles.emptyHint}>학습 세션을 완료하면 주제별 통계가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.container} role="region" aria-label="주제별 학습 시간">
      <h2 className={styles.title}>주제별 학습 시간</h2>
      <ul className={styles.list}>
        {topics.map((topic) => {
          const percent = totalMinutes > 0
            ? Math.round((topic.totalMinutes / totalMinutes) * 100)
            : 0;

          return (
            <li
              key={topic.topicId}
              className={styles.item}
              aria-label={`${topic.topicName} 학습 요약`}
            >
              <div className={styles.itemHeader}>
                <span className={styles.topicName}>{topic.topicName}</span>
                <span className={styles.topicTime}>{formatMinutes(topic.totalMinutes)}</span>
              </div>

              <div className={styles.itemDetails}>
                <div
                  className={styles.progressTrack}
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${topic.topicName} 비율`}
                >
                  <div
                    className={styles.progressFill}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className={styles.percentText} aria-label={`${percent}%`}>{percent}%</span>
              </div>

              <span className={styles.sessionCount}>{topic.sessionCount}회 세션</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
