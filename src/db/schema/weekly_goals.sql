-- Reference: weekly_goals table current schema
-- This file is for documentation only. Actual migrations are in migrations/ directory.

CREATE TABLE IF NOT EXISTS weekly_goals (
    id TEXT PRIMARY KEY NOT NULL,
    topic_id TEXT NOT NULL,
    week_start_at_ms INTEGER NOT NULL,
    target_minutes INTEGER NOT NULL,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE RESTRICT
);
