/**
 * 런타임 환경에 따라 올바른 Topic repository 함수를 반환한다.
 * Tauri에서는 SQLite 기반 repository를, 브라우저에서는 in-memory adapter를 사용한다.
 */
import { isTauriRuntime } from '../runtime/runtime-detect';
import type { Topic, CreateTopicInput, UpdateTopicInput } from '../../domain/topics/topic';
import type { Result } from '../../shared/lib/result';

export interface TopicRepositoryAdapter {
  createTopic(input: CreateTopicInput): Promise<Result<Topic>>;
  findAllTopics(includeArchived?: boolean): Promise<Result<Topic[]>>;
  findTopicById(id: string): Promise<Result<Topic>>;
  updateTopic(id: string, input: UpdateTopicInput): Promise<Result<Topic>>;
  archiveTopic(id: string): Promise<Result<Topic>>;
}

let adapter: TopicRepositoryAdapter | null = null;

async function getAdapter(): Promise<TopicRepositoryAdapter> {
  if (adapter) return adapter;

  if (isTauriRuntime()) {
    const mod = await import('../../domain/topics/topic-repository');
    adapter = mod;
  } else {
    const mod = await import('./in-memory-topic-adapter');
    adapter = mod;
  }

  return adapter;
}

export async function createTopic(input: CreateTopicInput): Promise<Result<Topic>> {
  return (await getAdapter()).createTopic(input);
}

export async function findAllTopics(includeArchived?: boolean): Promise<Result<Topic[]>> {
  return (await getAdapter()).findAllTopics(includeArchived);
}

export async function findTopicById(id: string): Promise<Result<Topic>> {
  return (await getAdapter()).findTopicById(id);
}

export async function updateTopic(id: string, input: UpdateTopicInput): Promise<Result<Topic>> {
  return (await getAdapter()).updateTopic(id, input);
}

export async function archiveTopic(id: string): Promise<Result<Topic>> {
  return (await getAdapter()).archiveTopic(id);
}
