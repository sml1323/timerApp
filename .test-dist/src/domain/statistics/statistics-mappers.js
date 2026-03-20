const DEFAULT_SUMMARY = { totalMinutes: 0, sessionCount: 0 };
export function toTodayStudySummary(row) {
    if (!row)
        return DEFAULT_SUMMARY;
    return {
        totalMinutes: Math.round(row.total_seconds / 60),
        sessionCount: row.session_count,
    };
}
export function toWeeklyStudySummary(row) {
    if (!row)
        return DEFAULT_SUMMARY;
    return {
        totalMinutes: Math.round(row.total_seconds / 60),
        sessionCount: row.session_count,
    };
}
export function toTopicStudySummary(row) {
    return {
        topicId: row.topic_id,
        topicName: row.topic_name,
        totalMinutes: Math.round(row.total_seconds / 60),
        sessionCount: row.session_count,
    };
}
