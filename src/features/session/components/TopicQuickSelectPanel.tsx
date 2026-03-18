import { useCallback } from 'react';
import { Link } from 'react-router';
import type { Topic } from '../../../domain/topics/topic';
import { cn } from '../../../shared/lib/cn';
import defaultCharacter from '../../../assets/characters/default.svg';
import styles from './TopicQuickSelectPanel.module.css';

interface TopicQuickSelectPanelProps {
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
  selectedTopicId: string | null;
  onSelectTopic: (id: string) => void;
}

export function TopicQuickSelectPanel({
  topics,
  isLoading,
  error,
  selectedTopicId,
  onSelectTopic,
}: TopicQuickSelectPanelProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (topics.length === 0) return;

      const currentIndex = topics.findIndex((t) => t.id === selectedTopicId);

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = currentIndex < topics.length - 1 ? currentIndex + 1 : currentIndex;
          onSelectTopic(topics[nextIndex].id);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
          onSelectTopic(topics[prevIndex].id);
          break;
        }
        case 'Home': {
          e.preventDefault();
          onSelectTopic(topics[0].id);
          break;
        }
        case 'End': {
          e.preventDefault();
          onSelectTopic(topics[topics.length - 1].id);
          break;
        }
        case 'Enter': {
          e.preventDefault();
          // Enter는 선택 확정 — 현재는 해당 항목만 선택 상태 유지
          if (currentIndex >= 0) {
            onSelectTopic(topics[currentIndex].id);
          }
          break;
        }
      }
    },
    [topics, selectedTopicId, onSelectTopic],
  );

  if (isLoading) {
    return (
      <div className={styles.panel} aria-busy="true">
        <p className={styles.loadingText}>주제 불러오는 중…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.panel} role="alert">
        <p className={styles.errorText}>주제를 불러올 수 없습니다: {error}</p>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className={styles.emptyState}>
        <img src={defaultCharacter} alt="" className={styles.characterImage} />
        <p className={styles.emptyMessage}>아직 학습 주제가 없습니다</p>
        <p className={styles.emptyHint}>주제를 만들면 바로 학습을 시작할 수 있어요</p>
        <Link to="/topics" className={styles.emptyAction}>
          주제 관리로 이동
        </Link>
      </div>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="주제 선택"
      aria-activedescendant={
        selectedTopicId ? `topic-option-${selectedTopicId}` : undefined
      }
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={styles.panel}
    >
      {topics.map((topic) => (
        <div
          key={topic.id}
          id={`topic-option-${topic.id}`}
          role="option"
          aria-selected={topic.id === selectedTopicId}
          onClick={() => onSelectTopic(topic.id)}
          className={cn(
            styles.topicItem,
            topic.id === selectedTopicId && styles.selected,
          )}
        >
          {topic.name}
        </div>
      ))}
    </div>
  );
}
