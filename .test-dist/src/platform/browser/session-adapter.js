/**
 * 런타임 환경에 따라 올바른 Session repository 함수를 반환한다.
 * Tauri에서는 SQLite 기반 repository를, 브라우저에서는 in-memory adapter를 사용한다.
 */
import { isTauriRuntime } from '../runtime/runtime-detect';
let adapter = null;
async function getAdapter() {
    if (adapter)
        return adapter;
    if (isTauriRuntime()) {
        const mod = await import('../../domain/sessions/session-repository');
        const statsMod = await import('../../domain/sessions/session-statistics');
        adapter = { ...mod, getWeeklyStudyMinutesByTopic: statsMod.getWeeklyStudyMinutesByTopic };
    }
    else {
        const mod = await import('./in-memory-session-adapter');
        adapter = mod;
    }
    return adapter;
}
export async function createSession(input) {
    return (await getAdapter()).createSession(input);
}
export async function findSessionById(id) {
    return (await getAdapter()).findSessionById(id);
}
export async function completeSession(input) {
    return (await getAdapter()).completeSession(input);
}
export async function interruptSession(input) {
    return (await getAdapter()).interruptSession(input);
}
export async function findSessionsByDateRange(startMs, endMs) {
    return (await getAdapter()).findSessionsByDateRange(startMs, endMs);
}
export async function getWeeklyStudyMinutesByTopic(weekStartAtMs) {
    return (await getAdapter()).getWeeklyStudyMinutesByTopic(weekStartAtMs);
}
