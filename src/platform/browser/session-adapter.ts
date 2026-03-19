/**
 * 런타임 환경에 따라 올바른 Session repository 함수를 반환한다.
 * Tauri에서는 SQLite 기반 repository를, 브라우저에서는 in-memory adapter를 사용한다.
 */
import { isTauriRuntime } from '../runtime/runtime-detect';
import type {
  Session,
  CreateSessionInput,
  CompleteSessionInput,
  InterruptSessionInput,
} from '../../domain/sessions/session';
import type { Result } from '../../shared/lib/result';

export interface SessionRepositoryAdapter {
  createSession(input: CreateSessionInput): Promise<Result<Session>>;
  findSessionById(id: string): Promise<Result<Session>>;
  completeSession(input: CompleteSessionInput): Promise<Result<Session>>;
  interruptSession(input: InterruptSessionInput): Promise<Result<Session>>;
  findSessionsByDateRange(startMs: number, endMs: number): Promise<Result<Session[]>>;
}

let adapter: SessionRepositoryAdapter | null = null;

async function getAdapter(): Promise<SessionRepositoryAdapter> {
  if (adapter) return adapter;

  if (isTauriRuntime()) {
    const mod = await import('../../domain/sessions/session-repository');
    adapter = mod;
  } else {
    const mod = await import('./in-memory-session-adapter');
    adapter = mod;
  }

  return adapter;
}

export async function createSession(input: CreateSessionInput): Promise<Result<Session>> {
  return (await getAdapter()).createSession(input);
}

export async function findSessionById(id: string): Promise<Result<Session>> {
  return (await getAdapter()).findSessionById(id);
}

export async function completeSession(input: CompleteSessionInput): Promise<Result<Session>> {
  return (await getAdapter()).completeSession(input);
}

export async function interruptSession(input: InterruptSessionInput): Promise<Result<Session>> {
  return (await getAdapter()).interruptSession(input);
}

export async function findSessionsByDateRange(startMs: number, endMs: number): Promise<Result<Session[]>> {
  return (await getAdapter()).findSessionsByDateRange(startMs, endMs);
}
