/**
 * 브라우저 QA mode 초기화.
 * Tauri native API가 없는 환경에서 앱 핵심 흐름을 검증할 수 있도록
 * seed 데이터를 주입한다.
 */
import { seedTopics } from './in-memory-topic-adapter';
import { setTopicExistsCheck } from './in-memory-session-adapter';
import type { Topic } from '../../domain/topics/topic';

/** QA mode에서 사용할 seed topics */
const SEED_TOPICS: Topic[] = [
  {
    id: 'qa-topic-1',
    name: 'Math',
    isArchived: false,
    createdAtMs: Date.now() - 86400000,
    updatedAtMs: Date.now() - 86400000,
  },
  {
    id: 'qa-topic-2',
    name: 'English',
    isArchived: false,
    createdAtMs: Date.now() - 72000000,
    updatedAtMs: Date.now() - 72000000,
  },
  {
    id: 'qa-topic-3',
    name: 'Programming',
    isArchived: false,
    createdAtMs: Date.now() - 43200000,
    updatedAtMs: Date.now() - 43200000,
  },
];

/** 브라우저 QA 런타임을 초기화한다 */
export async function initializeBrowserQaRuntime(): Promise<void> {
  // seed 주제 데이터 주입
  seedTopics(SEED_TOPICS);

  // session adapter에 topic 존재 검증 함수 연결
  const seedIds = new Set(SEED_TOPICS.map((t) => t.id));
  setTopicExistsCheck((id: string) => seedIds.has(id));

  console.info('[QA] Browser QA runtime initialized');
  console.info(`[QA] Seed topics: ${SEED_TOPICS.map((t) => t.name).join(', ')}`);
}
