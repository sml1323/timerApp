/**
 * 브라우저 QA mode용 in-memory Session persistence adapter.
 * session-repository.ts와 동일한 함수 시그니처를 제공한다.
 * raw SQL을 해석하지 않고, 도메인 로직을 직접 구현한다.
 */
import type {
  Session,
  CreateSessionInput,
  CompleteSessionInput,
  InterruptSessionInput,
  ReassignSessionTopicInput,
} from '../../domain/sessions/session';
import { ok, err, type Result } from '../../shared/lib/result.js';
import { ERROR_CODES } from '../../shared/lib/errors.js';
import { CreateSessionSchema, CompleteSessionSchema, InterruptSessionSchema, ReassignSessionTopicSchema } from '../../domain/sessions/session-schema.js';
import { validateTransition } from '../../domain/sessions/session-transitions.js';

/** in-memory 저장소 */
const store: Session[] = [];

/** topic 존재 검증용 — bootstrap 시 주입 */
let topicExistsCheck: (id: string) => boolean = () => true;

function getSessionDurationSeconds(session: Pick<Session, 'startedAtMs' | 'endedAtMs' | 'plannedDurationSec'>): number {
  if (session.endedAtMs !== null && session.endedAtMs >= session.startedAtMs) {
    return Math.max(0, Math.round((session.endedAtMs - session.startedAtMs) / 1000));
  }

  return session.plannedDurationSec;
}

export function setTopicExistsCheck(fn: (id: string) => boolean): void {
  topicExistsCheck = fn;
}

export async function createSession(input: CreateSessionInput): Promise<Result<Session>> {
  const parsed = CreateSessionSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? 'Invalid input');
  }
  const { topicId, phaseType, plannedDurationSec } = parsed.data;

  if (!topicExistsCheck(topicId)) {
    return err(ERROR_CODES.NOT_FOUND, 'Topic not found');
  }

  const running = store.find((s) => s.status === 'running');
  if (running) {
    return err(ERROR_CODES.SESSION_STATE_CONFLICT, 'A session is already running');
  }

  const now = Date.now();
  const session: Session = {
    id: crypto.randomUUID(),
    topicId,
    phaseType,
    status: 'running',
    startedAtMs: now,
    plannedDurationSec,
    endedAtMs: null,
    createdAtMs: now,
    updatedAtMs: now,
  };
  store.push(session);
  return ok(session);
}

export async function findSessionById(id: string): Promise<Result<Session>> {
  const session = store.find((s) => s.id === id);
  if (!session) {
    return err(ERROR_CODES.NOT_FOUND, 'Session not found');
  }
  return ok(session);
}

export async function completeSession(input: CompleteSessionInput): Promise<Result<Session>> {
  const parsed = CompleteSessionSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? 'Invalid input');
  }
  const { sessionId } = parsed.data;

  const index = store.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return err(ERROR_CODES.NOT_FOUND, 'Session not found');
  }

  const session = store[index];
  if (session.status !== 'running') {
    const transitionResult = validateTransition(session.status, 'completed');
    if (!transitionResult.ok) {
      return err(transitionResult.code, transitionResult.message);
    }
    return err(ERROR_CODES.PERSISTENCE_ERROR, 'The completed session update was not applied');
  }

  const now = Date.now();
  const updated: Session = { ...session, status: 'completed', endedAtMs: now, updatedAtMs: now };
  store[index] = updated;
  return ok(updated);
}

export async function interruptSession(input: InterruptSessionInput): Promise<Result<Session>> {
  const parsed = InterruptSessionSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? 'Invalid input');
  }
  const { sessionId } = parsed.data;

  const index = store.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return err(ERROR_CODES.NOT_FOUND, 'Session not found');
  }

  const session = store[index];
  if (session.status !== 'running') {
    const transitionResult = validateTransition(session.status, 'interrupted');
    if (!transitionResult.ok) {
      return err(transitionResult.code, transitionResult.message);
    }
    return err(ERROR_CODES.PERSISTENCE_ERROR, 'The interrupted session update was not applied');
  }

  const now = Date.now();
  const updated: Session = { ...session, status: 'interrupted', endedAtMs: now, updatedAtMs: now };
  store[index] = updated;
  return ok(updated);
}

export async function findSessionsByDateRange(startMs: number, endMs: number): Promise<Result<Session[]>> {
  const sessions = store
    .filter((s) => s.startedAtMs >= startMs && s.startedAtMs < endMs)
    .sort((a, b) => b.startedAtMs - a.startedAtMs);
  return ok(sessions);
}

export async function getWeeklyStudyMinutesByTopic(
  weekStartAtMs: number
): Promise<Result<Map<string, number>>> {
  const weekEndAtMs = weekStartAtMs + 7 * 24 * 60 * 60 * 1000;
  const secondsByTopic = new Map<string, number>();

  for (const s of store) {
    if (
      s.phaseType === 'study' &&
      (s.status === 'completed' || s.status === 'interrupted') &&
      s.startedAtMs >= weekStartAtMs &&
      s.startedAtMs < weekEndAtMs
    ) {
      const durationSec = getSessionDurationSeconds(s);
      secondsByTopic.set(s.topicId, (secondsByTopic.get(s.topicId) ?? 0) + durationSec);
    }
  }

  const map = new Map<string, number>();
  for (const [topicId, totalSeconds] of secondsByTopic.entries()) {
    map.set(topicId, Math.round(totalSeconds / 60));
  }
  return ok(map);
}

export async function reassignSessionTopic(input: ReassignSessionTopicInput): Promise<Result<Session>> {
  const parsed = ReassignSessionTopicSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? 'Invalid input');
  }
  const { sessionId, newTopicId } = parsed.data;

  const index = store.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return err(ERROR_CODES.NOT_FOUND, 'Session not found');
  }

  const session = store[index];
  if (session.status !== 'completed' && session.status !== 'interrupted') {
    return err(ERROR_CODES.SESSION_STATE_CONFLICT, 'Only completed or interrupted sessions can change topics');
  }

  if (!topicExistsCheck(newTopicId)) {
    return err(ERROR_CODES.NOT_FOUND, 'Topic not found');
  }

  const now = Date.now();
  const updated: Session = { ...session, topicId: newTopicId, updatedAtMs: now };
  store[index] = updated;
  return ok(updated);
}

/**
 * 방치된 running 세션을 interrupted로 일괄 전환한다.
 * 앱 부트스트랩 시 호출하여 비정상 종료로 남은 세션을 정리한다.
 */
export async function recoverAbandonedSessions(): Promise<Result<number>> {
  const now = Date.now();
  let recovered = 0;

  for (let i = 0; i < store.length; i++) {
    if (store[i].status === 'running') {
      store[i] = { ...store[i], status: 'interrupted', endedAtMs: now, updatedAtMs: now };
      recovered++;
    }
  }

  return ok(recovered);
}

/** 읽기 전용 세션 store 접근자 — in-memory-statistics-adapter에서 사용 */
export function getSessionStore(): readonly Session[] {
  return store;
}
