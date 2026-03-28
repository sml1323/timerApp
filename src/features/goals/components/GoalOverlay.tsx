import { useState } from 'react';
import { SlideUpPanel } from '../../../shared/ui/SlideUpPanel';
import { useGoalProgress } from '../hooks/useGoalProgress';
import { useWeeklyGoals } from '../hooks/useWeeklyGoals';
import { GoalProgressInline } from './GoalProgressInline';
import { GoalSettingsDialog } from './GoalSettingsDialog';
import styles from './GoalOverlay.module.css';

interface GoalOverlayProps {
  onClose: () => void;
}

export function GoalOverlay({ onClose }: GoalOverlayProps) {
  const { progressList, isLoading, refetch } = useGoalProgress();
  const { goals, saveGoalForTopic } = useWeeklyGoals();
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  const editingGoal = editingTopicId ? (goals.get(editingTopicId) ?? null) : null;
  const editingProgress = editingTopicId
    ? progressList.find((p) => p.topicId === editingTopicId)
    : null;

  const handleSaveGoal = async (topicId: string, targetMinutes: number) => {
    const result = await saveGoalForTopic(topicId, targetMinutes);
    if (result.ok) {
      await refetch();
      setEditingTopicId(null);
    }
    return result;
  };

  return (
    <SlideUpPanel onClose={onClose} title="주간 목표">
      {isLoading && <p className={styles.loading}>불러오는 중...</p>}

      {progressList.length === 0 && !isLoading && (
        <p className={styles.empty}>주제를 먼저 추가한 후 목표를 설정하세요.</p>
      )}

      <div className={styles.list}>
        {progressList.map((progress) => (
          <button
            key={progress.topicId}
            className={styles.goalItem}
            onClick={() => setEditingTopicId(progress.topicId)}
            type="button"
          >
            <span className={styles.topicName}>{progress.topicName}</span>
            <GoalProgressInline progress={progress} variant="compact" />
          </button>
        ))}
      </div>

      {editingTopicId && (
        <GoalSettingsDialog
          topicId={editingTopicId}
          topicName={editingProgress?.topicName ?? ''}
          existingGoal={editingGoal}
          isOpen={editingTopicId !== null}
          onSave={handleSaveGoal}
          onClose={() => setEditingTopicId(null)}
        />
      )}
    </SlideUpPanel>
  );
}
