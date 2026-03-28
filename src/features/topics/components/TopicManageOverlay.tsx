import { useState } from 'react';
import { SlideUpPanel } from '../../../shared/ui/SlideUpPanel';
import { useTopics } from '../hooks/useTopics';
import { TopicCard } from './TopicCard';
import { TopicForm } from './TopicForm';
import styles from './TopicManageOverlay.module.css';

interface TopicManageOverlayProps {
  onClose: () => void;
}

export function TopicManageOverlay({ onClose }: TopicManageOverlayProps) {
  const { topics, isLoading, error, createNewTopic, updateExistingTopic, archiveExistingTopic } = useTopics();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (name: string) => {
    const result = await createNewTopic(name);
    if (result.ok) setShowForm(false);
    return result;
  };

  return (
    <SlideUpPanel onClose={onClose} title="주제 관리">
      {error && <p className={styles.error}>{error}</p>}
      {isLoading && <p className={styles.loading}>불러오는 중...</p>}

      <div className={styles.list}>
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onEdit={(name) => updateExistingTopic(topic.id, name)}
            onArchive={() => archiveExistingTopic(topic.id)}
          />
        ))}
      </div>

      {showForm ? (
        <div>
          <TopicForm onSubmit={handleCreate} />
          <button className={styles.cancelBtn} onClick={() => setShowForm(false)} type="button">취소</button>
        </div>
      ) : (
        <button className={styles.addBtn} onClick={() => setShowForm(true)} type="button">
          + 새 주제 추가
        </button>
      )}
    </SlideUpPanel>
  );
}
