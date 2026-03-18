import type { Session } from './session';

/** DB row 타입 — snake_case */
export interface SessionRow {
  id: string;
  topic_id: string;
  phase_type: string;        // 'study' | 'break'
  status: string;            // 'planned' | 'running' | 'completed' | 'interrupted'
  started_at_ms: number;
  planned_duration_sec: number;
  ended_at_ms: number | null;
  created_at_ms: number;
  updated_at_ms: number;
}

/** DB row → TS 객체 변환 */
export function toSession(row: SessionRow): Session {
  return {
    id: row.id,
    topicId: row.topic_id,
    phaseType: row.phase_type as Session['phaseType'],
    status: row.status as Session['status'],
    startedAtMs: row.started_at_ms,
    plannedDurationSec: row.planned_duration_sec,
    endedAtMs: row.ended_at_ms,
    createdAtMs: row.created_at_ms,
    updatedAtMs: row.updated_at_ms,
  };
}
