/**
 * 런타임 환경에 따라 올바른 Topic repository 함수를 반환한다.
 * Tauri에서는 SQLite 기반 repository를, 브라우저에서는 in-memory adapter를 사용한다.
 */
import { isTauriRuntime } from '../runtime/runtime-detect';
let adapter = null;
async function getAdapter() {
    if (adapter)
        return adapter;
    if (isTauriRuntime()) {
        const mod = await import('../../domain/topics/topic-repository');
        adapter = mod;
    }
    else {
        const mod = await import('./in-memory-topic-adapter');
        adapter = mod;
    }
    return adapter;
}
export async function createTopic(input) {
    return (await getAdapter()).createTopic(input);
}
export async function findAllTopics(includeArchived) {
    return (await getAdapter()).findAllTopics(includeArchived);
}
export async function findTopicById(id) {
    return (await getAdapter()).findTopicById(id);
}
export async function updateTopic(id, input) {
    return (await getAdapter()).updateTopic(id, input);
}
export async function archiveTopic(id) {
    return (await getAdapter()).archiveTopic(id);
}
