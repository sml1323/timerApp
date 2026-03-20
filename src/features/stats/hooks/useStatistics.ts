import { useState, useEffect, useCallback } from 'react';
import { loadStatsPageData, type StatsPageData } from '../statistics-service';
import { useSessionStore } from '../../session/state/sessionStore';

export function useStatistics() {
  const lastCompletedAtMs = useSessionStore((state) => state.lastCompletedAtMs);
  const [data, setData] = useState<StatsPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await loadStatsPageData();
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
