import type { Topic } from './topic';

/** DB row 타입 — snake_case */
export interface TopicRow {
  id: string;
  name: string;
  is_archived: number; // SQLite: 0 | 1
  created_at_ms: number;
  updated_at_ms: number;
}

/** DB row → TS 객체 변환 */
export function toTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    name: row.name,
    isArchived: row.is_archived === 1,
    createdAtMs: row.created_at_ms,
    updatedAtMs: row.updated_at_ms,
  };
}

/** TS 객체 → DB row 부분 변환 (insert/update용) */
export function toTopicRow(topic: Partial<Topic>): Partial<TopicRow> {
  const row: Partial<TopicRow> = {};

  if (topic.id !== undefined) row.id = topic.id;
  if (topic.name !== undefined) row.name = topic.name;
  if (topic.isArchived !== undefined) row.is_archived = topic.isArchived ? 1 : 0;
  if (topic.createdAtMs !== undefined) row.created_at_ms = topic.createdAtMs;
  if (topic.updatedAtMs !== undefined) row.updated_at_ms = topic.updatedAtMs;

  return row;
}
