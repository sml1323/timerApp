import type { Topic } from '../../../domain/topics/topic';
import styles from './TopicCard.module.css';

interface TopicCardProps {
  topic: Topic;
}

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(ms));
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.name}>{topic.name}</span>
      <span className={styles.date}>{formatDate(topic.createdAtMs)}</span>
    </div>
  );
}
