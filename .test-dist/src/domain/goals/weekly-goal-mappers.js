/** DB row → TS 객체 변환 */
export function toWeeklyGoal(row) {
    return {
        id: row.id,
        topicId: row.topic_id,
        weekStartAtMs: row.week_start_at_ms,
        targetMinutes: row.target_minutes,
        createdAtMs: row.created_at_ms,
        updatedAtMs: row.updated_at_ms,
    };
}
/** TS 객체 → DB row 부분 변환 (insert/update용) */
export function toWeeklyGoalRow(goal) {
    const row = {};
    if (goal.id !== undefined)
        row.id = goal.id;
    if (goal.topicId !== undefined)
        row.topic_id = goal.topicId;
    if (goal.weekStartAtMs !== undefined)
        row.week_start_at_ms = goal.weekStartAtMs;
    if (goal.targetMinutes !== undefined)
        row.target_minutes = goal.targetMinutes;
    if (goal.createdAtMs !== undefined)
        row.created_at_ms = goal.createdAtMs;
    if (goal.updatedAtMs !== undefined)
        row.updated_at_ms = goal.updatedAtMs;
    return row;
}
