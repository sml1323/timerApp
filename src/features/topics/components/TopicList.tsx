import type { Topic } from '../../../domain/topics/topic';
import { TopicCard } from './TopicCard';
import styles from './TopicList.module.css';

interface TopicListProps {
  topics: Topic[];
  onEdit: (id: string, name: string) => Promise<{ ok: boolean; message?: string }>;
  onArchive: (id: string) => Promise<{ ok: boolean; message?: string }>;
}

export function TopicList({ topics, onEdit, onArchive }: TopicListProps) {
  return (
    <ul className={styles.list} role="list">
      {topics.map((topic) => (
        <li key={topic.id} className={styles.item}>
          <TopicCard topic={topic} onEdit={onEdit} onArchive={onArchive} />
        </li>
      ))}
    </ul>
  );
}
