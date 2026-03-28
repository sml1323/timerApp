import { useState, useMemo } from 'react';
import { useTopics } from './hooks/useTopics';
import { useWeeklyGoals } from '../goals/hooks/useWeeklyGoals';
import { useGoalProgress } from '../goals/hooks/useGoalProgress';
import { TopicForm } from './components/TopicForm';
import { TopicList } from './components/TopicList';
import { GoalSettingsDialog } from '../goals/components/GoalSettingsDialog';
import styles from './TopicsPage.module.css';

export function TopicsPage() {
  const { topics, isLoading, error, createNewTopic, updateExistingTopic, archiveExistingTopic } = useTopics();
  const { goals, saveGoalForTopic } = useWeeklyGoals();
  const { progressList } = useGoalProgress();

  const goalProgressMap = useMemo(() => {
    const map = new Map<string, (typeof progressList)[number]>();
    for (const p of progressList) {
      map.set(p.topicId, p);
    }
    return map;
  }, [progressList]);

  const [goalDialogTopicId, setGoalDialogTopicId] = useState<string | null>(null);

  const isEmpty = !isLoading && topics.length === 0;

  const handleEdit = async (id: string, name: string) => {
    const result = await updateExistingTopic(id, name);
    return { ok: result.ok, message: result.ok ? undefined : result.message };
  };

  const handleArchive = async (id: string) => {
    const result = await archiveExistingTopic(id);
    return { ok: result.ok, message: result.ok ? undefined : result.message };
  };

  const handleOpenGoalDialog = (topicId: string) => {
    setGoalDialogTopicId(topicId);
  };

  const handleCloseGoalDialog = () => {
    setGoalDialogTopicId(null);
  };

  const dialogTopic = goalDialogTopicId
    ? topics.find((t) => t.id === goalDialogTopicId)
    : null;

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>주제 관리</h1>

      {isLoading && (
        <div className={styles.loadingState}>
          <p className={styles.loadingText}>주제를 불러오는 중...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className={styles.errorState} role="alert">
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {isEmpty && (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>첫 학습 주제를 만들어보세요</p>
        </div>
      )}

      <div className={styles.formSection}>
        <TopicForm onSubmit={async (name) => {
          const result = await createNewTopic(name);
          return { ok: result.ok, message: result.ok ? undefined : result.message };
        }} />
      </div>

      {!isLoading && topics.length > 0 && (
        <div className={styles.listSection}>
          <TopicList
            topics={topics}
            weeklyGoals={goals}
            goalProgressMap={goalProgressMap}
            onEdit={handleEdit}
            onArchive={handleArchive}
            onOpenGoalDialog={handleOpenGoalDialog}
          />
        </div>
      )}

      {dialogTopic && (
        <GoalSettingsDialog
          topicName={dialogTopic.name}
          topicId={dialogTopic.id}
          existingGoal={goals.get(dialogTopic.id) ?? null}
          isOpen={goalDialogTopicId !== null}
          onClose={handleCloseGoalDialog}
          onSave={saveGoalForTopic}
        />
      )}
    </section>
  );
}
