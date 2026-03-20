import { useState, useEffect, useCallback } from 'react';
import { loadSessionRecords, reassignRecordTopic, type SessionRecordItem } from '../record-correction-service';
import { useSessionStore } from '../../session/state/sessionStore';

export function useRecordCorrection() {
  const lastCompletedAtMs = useSessionStore((state) => state.lastCompletedAtMs);
  const [records, setRecords] = useState<SessionRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await loadSessionRecords();
    if (result.ok) {
      setRecords(result.data);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords, lastCompletedAtMs]);

  const reassignTopic = useCallback(async (sessionId: string, newTopicId: string) => {
    const result = await reassignRecordTopic(sessionId, newTopicId);
    if (result.ok) {
      await fetchRecords(); // 목록 갱신
    }
    return result;
  }, [fetchRecords]);

  return { records, isLoading, error, refetch: fetchRecords, reassignTopic };
}
