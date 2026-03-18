import { useState, useEffect, useCallback } from 'react';
import type { Topic } from '../../../domain/topics/topic';
import { loadTopics, addTopic, editTopic, removeTopic } from '../topic-service';

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await loadTopics();
    if (result.ok) {
      setTopics(result.data);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const createNewTopic = useCallback(async (name: string) => {
    const result = await addTopic({ name });
    if (result.ok) {
      // 생성 성공 시 목록 새로고침
      await fetchTopics();
    }
    return result;
  }, [fetchTopics]);

  const updateExistingTopic = useCallback(async (id: string, name: string) => {
    const result = await editTopic(id, { name });
    if (result.ok) {
      await fetchTopics();
    }
    return result;
  }, [fetchTopics]);

  const archiveExistingTopic = useCallback(async (id: string) => {
    const result = await removeTopic(id);
    if (result.ok) {
      // 아카이브 후 목록 갱신 → 해당 주제 자동 제거
      await fetchTopics();
    }
    return result;
  }, [fetchTopics]);

  return { topics, isLoading, error, createNewTopic, updateExistingTopic, archiveExistingTopic, refetch: fetchTopics };
}
