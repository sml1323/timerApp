import type { TopicStudySummary } from '../../../domain/statistics/statistics';
import styles from './TopicBreakdownList.module.css';

interface TopicBreakdownListProps {
  topics: TopicStudySummary[];
  totalMinutes: number;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

// Simple color palette for topic dots
const TOPIC_COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#3b82f6',
  '#22c55e', '#f59e0b', '#ef4444', '#ec4899',
];

export function TopicBreakdownList({ topics }: TopicBreakdownListProps) {
  if (topics.length === 0) {
    return (
      <div className={styles.emptyState} role="region" aria-label="주제별 학습 시간">
        <p className={styles.emptyMessage}>아직 학습 기록이 없습니다</p>
        <p className={styles.emptyHint}>학습 세션을 완료하면 주제별 분석이 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.container} role="region" aria-label="주제별 학습 시간">
      <h2 className={styles.title}>주제별 학습 시간</h2>
      <ul className={styles.list}>
        {topics.map((topic, index) => {
          const color = TOPIC_COLORS[index % TOPIC_COLORS.length];

          return (
            <li
              key={topic.topicId}
              className={styles.item}
              aria-label={`${topic.topicName} 학습 요약`}
            >
              <span
                className={styles.colorDot}
                style={{ background: color }}
                aria-hidden="true"
              />
              <span className={styles.topicName}>{topic.topicName}</span>
              <span className={styles.topicTime}>{formatMinutes(topic.totalMinutes)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
