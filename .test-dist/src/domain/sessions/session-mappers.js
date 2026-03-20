/** DB row → TS 객체 변환 */
export function toSession(row) {
    return {
        id: row.id,
        topicId: row.topic_id,
        phaseType: row.phase_type,
        status: row.status,
        startedAtMs: row.started_at_ms,
        plannedDurationSec: row.planned_duration_sec,
        endedAtMs: row.ended_at_ms,
        createdAtMs: row.created_at_ms,
        updatedAtMs: row.updated_at_ms,
    };
}
