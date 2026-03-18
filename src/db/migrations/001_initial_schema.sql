-- topics table
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL
);

-- weekly_goals table
CREATE TABLE IF NOT EXISTS weekly_goals (
    id TEXT PRIMARY KEY NOT NULL,
    topic_id TEXT NOT NULL,
    week_start_at_ms INTEGER NOT NULL,
    target_minutes INTEGER NOT NULL,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE RESTRICT
);

-- sessions table
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
