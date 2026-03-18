import { useState, useEffect, useCallback } from 'react';
import type { Topic } from '../../../domain/topics/topic';
import { loadTopics } from '../../topics/topic-service';

export function useTopicSelect() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const fetchTopics = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    const result = await loadTopics();
    
    if (signal?.aborted) return;
    
    if (result.ok) {
      setTopics(result.data);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTopics(controller.signal);
    return () => controller.abort();
  }, [fetchTopics]);

  const selectTopic = useCallback((id: string) => {
    setSelectedTopicId(id);
  }, []);

  const isReady = selectedTopicId !== null;

  return { topics, isLoading, error, selectedTopicId, selectTopic, isReady };
}
