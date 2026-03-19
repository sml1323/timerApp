import { createTopic, findAllTopics, updateTopic, archiveTopic } from '../../platform/browser/topic-adapter';
import type { Topic, CreateTopicInput, UpdateTopicInput } from '../../domain/topics/topic';
import type { Result } from '../../shared/lib/result';

/** 활성 주제 목록 조회 */
export async function loadTopics(): Promise<Result<Topic[]>> {
  return findAllTopics(false);
}

/** 새 주제 생성 */
export async function addTopic(input: CreateTopicInput): Promise<Result<Topic>> {
  return createTopic(input);
}

/** 주제 이름 수정 */
export async function editTopic(id: string, input: UpdateTopicInput): Promise<Result<Topic>> {
  return updateTopic(id, input);
}

/** 주제 아카이브 (정리) */
export async function removeTopic(id: string): Promise<Result<Topic>> {
  return archiveTopic(id);
}
