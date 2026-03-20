/** DB row → TS 객체 변환 */
export function toTopic(row) {
    return {
        id: row.id,
        name: row.name,
        isArchived: row.is_archived === 1,
        createdAtMs: row.created_at_ms,
        updatedAtMs: row.updated_at_ms,
    };
}
/** TS 객체 → DB row 부분 변환 (insert/update용) */
export function toTopicRow(topic) {
    const row = {};
    if (topic.id !== undefined)
        row.id = topic.id;
    if (topic.name !== undefined)
        row.name = topic.name;
    if (topic.isArchived !== undefined)
        row.is_archived = topic.isArchived ? 1 : 0;
    if (topic.createdAtMs !== undefined)
        row.created_at_ms = topic.createdAtMs;
    if (topic.updatedAtMs !== undefined)
        row.updated_at_ms = topic.updatedAtMs;
    return row;
}
