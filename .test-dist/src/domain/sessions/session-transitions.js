import { ok, err } from '../../shared/lib/result';
import { ERROR_CODES } from '../../shared/lib/errors';
/** 유효한 상태 전이 맵 */
const VALID_TRANSITIONS = {
    planned: ['running'],
    running: ['completed', 'interrupted'],
    completed: [],
    interrupted: [],
};
/** 상태 전이 가능 여부 확인 */
export function canTransition(from, to) {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
/** 상태 전이 검증 — 실패 시 SESSION_STATE_CONFLICT 에러 반환 */
export function validateTransition(from, to) {
    if (canTransition(from, to)) {
        return ok(undefined);
    }
    return err(ERROR_CODES.SESSION_STATE_CONFLICT, `세션 상태를 '${from}'에서 '${to}'로 변경할 수 없습니다`);
}
