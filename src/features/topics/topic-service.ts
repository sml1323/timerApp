import { createTopic, findAllTopics } from '../../domain/topics/topic-repository';
import type { Topic, CreateTopicInput } from '../../domain/topics/topic';
import type { Result } from '../../shared/lib/result';

/** 활성 주제 목록 조회 */
export async function loadTopics(): Promise<Result<Topic[]>> {
  return findAllTopics(false);
}

/** 새 주제 생성 */
export async function addTopic(input: CreateTopicInput): Promise<Result<Topic>> {
  return createTopic(input);
}
