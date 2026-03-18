-- Reference: sessions table current schema
-- This file is for documentation only. Actual migrations are in migrations/ directory.

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    topic_id TEXT NOT NULL,
    phase_type TEXT NOT NULL CHECK (phase_type IN ('study', 'break')),
    status TEXT NOT NULL CHECK (status IN ('planned', 'running', 'completed', 'interrupted')),
    started_at_ms INTEGER NOT NULL,
    planned_duration_sec INTEGER NOT NULL,
    ended_at_ms INTEGER,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE RESTRICT
);
