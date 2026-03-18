UPDATE sessions
SET
    status = 'interrupted',
    ended_at_ms = COALESCE(ended_at_ms, updated_at_ms),
    updated_at_ms = max(updated_at_ms, COALESCE(ended_at_ms, updated_at_ms))
WHERE status = 'running'
  AND id NOT IN (
      SELECT id
      FROM sessions
      WHERE status = 'running'
      ORDER BY started_at_ms DESC, created_at_ms DESC, id DESC
      LIMIT 1
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_single_running
    ON sessions(status)
    WHERE status = 'running';
