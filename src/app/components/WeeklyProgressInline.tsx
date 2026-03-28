import { useEffect } from 'react';
import { useGoalProgress } from '../../features/goals/hooks/useGoalProgress';
import { useSessionPhase } from '../../features/session/state/sessionSelectors';
import styles from './WeeklyProgressInline.module.css';
import { useDashboardData } from '../../features/dashboard/hooks/useDashboardData';

export function WeeklyProgressInline() {
  const { progressList, refetch } = useGoalProgress();
  const { data: dashboardData } = useDashboardData();
  const sessionPhase = useSessionPhase();

  useEffect(() => {
    if (sessionPhase === 'idle' || sessionPhase === 'completed') {
      refetch();
    }
  }, [sessionPhase, refetch]);

  const weeklyMinutes = dashboardData?.weeklyMinutes ?? 0;
  const hours = Math.floor(weeklyMinutes / 60);
  const minutes = weeklyMinutes % 60;

  const achievedCount = progressList.filter((p) => p.isAchieved).length;
  const totalGoalCount = progressList.length;

  const timeText = hours > 0
    ? minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`
    : `${minutes}분`;

  return (
    <p className={styles.text}>
      이번 주 {timeText}
      {totalGoalCount > 0 && (
        <span className={styles.goal}> ({achievedCount}/{totalGoalCount} 달성)</span>
      )}
    </p>
  );
}
