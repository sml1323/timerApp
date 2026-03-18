-- Reference: topics table current schema
-- This file is for documentation only. Actual migrations are in migrations/ directory.

CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL
);
