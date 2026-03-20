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
import { ok, err, type Result } from '../../shared/lib/result';
import { ERROR_CODES } from '../../shared/lib/errors';
import { CreateSessionSchema, CompleteSessionSchema, InterruptSessionSchema, ReassignSessionTopicSchema } from '../../domain/sessions/session-schema';
import { validateTransition } from '../../domain/sessions/session-transitions';

/** in-memory 저장소 */
const store: Session[] = [];

/** topic 존재 검증용 — bootstrap 시 주입 */
let topicExistsCheck: (id: string) => boolean = () => true;

export function setTopicExistsCheck(fn: (id: string) => boolean): void {
  topicExistsCheck = fn;
}

export async function createSession(input: CreateSessionInput): Promise<Result<Session>> {
  const parsed = CreateSessionSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
  }
  const { topicId, phaseType, plannedDurationSec } = parsed.data;

  if (!topicExistsCheck(topicId)) {
    return err(ERROR_CODES.NOT_FOUND, '주제를 찾을 수 없습니다');
  }

  const running = store.find((s) => s.status === 'running');
  if (running) {
    return err(ERROR_CODES.SESSION_STATE_CONFLICT, '이미 진행 중인 세션이 있습니다');
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
    return err(ERROR_CODES.NOT_FOUND, '세션을 찾을 수 없습니다');
  }
  return ok(session);
}

export async function completeSession(input: CompleteSessionInput): Promise<Result<Session>> {
  const parsed = CompleteSessionSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
  }
  const { sessionId } = parsed.data;

  const index = store.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return err(ERROR_CODES.NOT_FOUND, '세션을 찾을 수 없습니다');
  }

  const session = store[index];
  if (session.status !== 'running') {
    const transitionResult = validateTransition(session.status, 'completed');
    if (!transitionResult.ok) {
      return err(transitionResult.code, transitionResult.message);
    }
    return err(ERROR_CODES.PERSISTENCE_ERROR, '세션 완료 업데이트가 적용되지 않았습니다');
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
    return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
  }
  const { sessionId } = parsed.data;

  const index = store.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return err(ERROR_CODES.NOT_FOUND, '세션을 찾을 수 없습니다');
  }

  const session = store[index];
  if (session.status !== 'running') {
    const transitionResult = validateTransition(session.status, 'interrupted');
    if (!transitionResult.ok) {
      return err(transitionResult.code, transitionResult.message);
    }
    return err(ERROR_CODES.PERSISTENCE_ERROR, '세션 중단 업데이트가 적용되지 않았습니다');
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
  const map = new Map<string, number>();

  for (const s of store) {
    if (
      s.phaseType === 'study' &&
      s.status === 'completed' &&
      s.startedAtMs >= weekStartAtMs &&
      s.startedAtMs < weekEndAtMs
    ) {
      const mins = Math.round(s.plannedDurationSec / 60);
      map.set(s.topicId, (map.get(s.topicId) ?? 0) + mins);
    }
  }
  return ok(map);
}

export async function reassignSessionTopic(input: ReassignSessionTopicInput): Promise<Result<Session>> {
  const parsed = ReassignSessionTopicSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
  }
  const { sessionId, newTopicId } = parsed.data;

  const index = store.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return err(ERROR_CODES.NOT_FOUND, '세션을 찾을 수 없습니다');
  }

  const session = store[index];
  if (session.status !== 'completed' && session.status !== 'interrupted') {
    return err(ERROR_CODES.SESSION_STATE_CONFLICT, '완료되거나 중단된 세션만 주제를 변경할 수 있습니다');
  }

  if (!topicExistsCheck(newTopicId)) {
    return err(ERROR_CODES.NOT_FOUND, '주제를 찾을 수 없습니다');
  }

  const now = Date.now();
  const updated: Session = { ...session, topicId: newTopicId, updatedAtMs: now };
  store[index] = updated;
  return ok(updated);
}

/** 읽기 전용 세션 store 접근자 — in-memory-statistics-adapter에서 사용 */
export function getSessionStore(): readonly Session[] {
  return store;
}

