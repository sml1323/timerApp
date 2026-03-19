import { useState, useEffect, useCallback } from 'react';
import type { WeeklyGoal } from '../../../domain/goals/weekly-goal';
import { loadGoalForTopicThisWeek, saveGoal, loadAllGoalsThisWeek } from '../goal-service';

export function useWeeklyGoals() {
  const [goals, setGoals] = useState<Map<string, WeeklyGoal | null>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await loadAllGoalsThisWeek();
    if (result.ok) {
      const map = new Map<string, WeeklyGoal | null>();
      for (const goal of result.data) {
        map.set(goal.topicId, goal);
      }
      setGoals(map);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllGoals();
  }, [fetchAllGoals]);

  const loadGoalForTopic = useCallback(async (topicId: string) => {
    const result = await loadGoalForTopicThisWeek(topicId);
    if (result.ok) {
      setGoals((prev) => {
        const next = new Map(prev);
        next.set(topicId, result.data);
        return next;
      });
    }
    return result;
  }, []);

  const saveGoalForTopic = useCallback(async (topicId: string, targetMinutes: number) => {
    const result = await saveGoal(topicId, targetMinutes);
    if (result.ok) {
      setGoals((prev) => {
        const next = new Map(prev);
        next.set(topicId, result.data);
        return next;
      });
    }
    return result;
  }, []);

  return { goals, isLoading, error, loadGoalForTopic, saveGoalForTopic, refetch: fetchAllGoals };
}
