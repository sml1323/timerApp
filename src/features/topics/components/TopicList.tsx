import type { Topic } from '../../../domain/topics/topic';
import type { WeeklyGoal } from '../../../domain/goals/weekly-goal';
import type { GoalProgress } from '../../goals/goal-service';
import { TopicCard } from './TopicCard';
import styles from './TopicList.module.css';

interface TopicListProps {
  topics: Topic[];
  weeklyGoals: Map<string, WeeklyGoal | null>;
  goalProgressMap?: Map<string, GoalProgress>;
  onEdit: (id: string, name: string) => Promise<{ ok: boolean; message?: string }>;
  onArchive: (id: string) => Promise<{ ok: boolean; message?: string }>;
  onOpenGoalDialog: (topicId: string) => void;
}

export function TopicList({ topics, weeklyGoals, goalProgressMap, onEdit, onArchive, onOpenGoalDialog }: TopicListProps) {
  return (
    <ul className={styles.list} role="list">
      {topics.map((topic) => (
        <li key={topic.id} className={styles.item}>
          <TopicCard
            topic={topic}
            weeklyGoal={weeklyGoals.get(topic.id) ?? null}
            goalProgress={goalProgressMap?.get(topic.id) ?? null}
            onEdit={onEdit}
            onArchive={onArchive}
            onOpenGoalDialog={onOpenGoalDialog}
          />
        </li>
      ))}
    </ul>
  );
}
