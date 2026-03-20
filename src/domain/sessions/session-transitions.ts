import type { SessionStatus } from './session';
import { ok, err, type Result } from '../../shared/lib/result.js';
import { ERROR_CODES } from '../../shared/lib/errors.js';

/** 유효한 상태 전이 맵 */
const VALID_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  planned: ['running'],
  running: ['completed', 'interrupted'],
  completed: [],
  interrupted: [],
};

/** 상태 전이 가능 여부 확인 */
export function canTransition(from: SessionStatus, to: SessionStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/** 상태 전이 검증 — 실패 시 SESSION_STATE_CONFLICT 에러 반환 */
export function validateTransition(from: SessionStatus, to: SessionStatus): Result<void> {
  if (canTransition(from, to)) {
    return ok(undefined);
  }
  return err(
    ERROR_CODES.SESSION_STATE_CONFLICT,
    `세션 상태를 '${from}'에서 '${to}'로 변경할 수 없습니다`,
  );
}
