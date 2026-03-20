import { useState, useEffect, useCallback } from 'react';
import { loadDashboardData, type DashboardData } from '../dashboard-service';
import { useSessionStore } from '../../session/state/sessionStore';

export function useDashboardData() {
  const lastCompletedAtMs = useSessionStore((state) => state.lastCompletedAtMs);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await loadDashboardData();
    if (result.ok) {
      setData(result.data);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, lastCompletedAtMs]);

  return { data, isLoading, error, refetch: fetchData };
}
