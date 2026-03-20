import { useState, useEffect, useCallback } from 'react';
import type { GoalProgress } from '../goal-service';
import { loadGoalProgressThisWeek } from '../goal-service';

export function useGoalProgress() {
  const [progressList, setProgressList] = useState<GoalProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await loadGoalProgressThisWeek();
    if (result.ok) {
      setProgressList(result.data);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progressList, isLoading, error, refetch: fetchProgress };
}
