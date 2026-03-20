import type { TodayStudySummary, WeeklyStudySummary, TopicStudySummary } from './statistics';

/** DB 집계 결과 row 타입 */
export interface StudySummaryRow {
  total_seconds: number;
  session_count: number;
}

export interface TopicStudySummaryRow {
  topic_id: string;
  topic_name: string;
  total_seconds: number;
  session_count: number;
}

const DEFAULT_SUMMARY = { totalMinutes: 0, sessionCount: 0 };

export function toTodayStudySummary(row: StudySummaryRow | undefined): TodayStudySummary {
  if (!row) return DEFAULT_SUMMARY;
  return {
    totalMinutes: Math.round(row.total_seconds / 60),
    sessionCount: row.session_count,
  };
}

export function toWeeklyStudySummary(row: StudySummaryRow | undefined): WeeklyStudySummary {
  if (!row) return DEFAULT_SUMMARY;
  return {
    totalMinutes: Math.round(row.total_seconds / 60),
    sessionCount: row.session_count,
  };
}

export function toTopicStudySummary(row: TopicStudySummaryRow): TopicStudySummary {
  return {
    topicId: row.topic_id,
    topicName: row.topic_name,
    totalMinutes: Math.round(row.total_seconds / 60),
    sessionCount: row.session_count,
  };
}
