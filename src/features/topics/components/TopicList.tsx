import type { Topic } from '../../../domain/topics/topic';
import { TopicCard } from './TopicCard';
import styles from './TopicList.module.css';

interface TopicListProps {
  topics: Topic[];
}

export function TopicList({ topics }: TopicListProps) {
  return (
    <ul className={styles.list} role="list">
      {topics.map((topic) => (
        <li key={topic.id} className={styles.item}>
          <TopicCard topic={topic} />
        </li>
      ))}
    </ul>
  );
}
