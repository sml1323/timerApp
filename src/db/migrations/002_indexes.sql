CREATE INDEX IF NOT EXISTS idx_sessions_topic_id_started_at_ms
    ON sessions(topic_id, started_at_ms);

CREATE INDEX IF NOT EXISTS idx_sessions_status
    ON sessions(status);

CREATE INDEX IF NOT EXISTS idx_weekly_goals_topic_id_week_start_at_ms
    ON weekly_goals(topic_id, week_start_at_ms);

CREATE INDEX IF NOT EXISTS idx_topics_is_archived
    ON topics(is_archived);
