/**
 * 런타임 환경에 따라 올바른 Goal repository 함수를 반환한다.
 * Tauri에서는 SQLite 기반 repository를, 브라우저에서는 in-memory adapter를 사용한다.
 */
import { isTauriRuntime } from '../runtime/runtime-detect';
let adapter = null;
async function getAdapter() {
    if (adapter)
        return adapter;
    if (isTauriRuntime()) {
        const mod = await import('../../domain/goals/weekly-goal-repository');
        adapter = mod;
    }
    else {
        const mod = await import('./in-memory-goal-adapter');
        adapter = mod;
    }
    return adapter;
}
export async function createWeeklyGoal(input) {
    return (await getAdapter()).createWeeklyGoal(input);
}
export async function updateWeeklyGoal(id, input) {
    return (await getAdapter()).updateWeeklyGoal(id, input);
}
export async function findByTopicAndWeek(topicId, weekStartAtMs) {
    return (await getAdapter()).findByTopicAndWeek(topicId, weekStartAtMs);
}
export async function findAllByWeek(weekStartAtMs) {
    return (await getAdapter()).findAllByWeek(weekStartAtMs);
}
