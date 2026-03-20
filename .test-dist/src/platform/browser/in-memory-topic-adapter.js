import { ok, err } from '../../shared/lib/result';
import { ERROR_CODES } from '../../shared/lib/errors';
import { CreateTopicSchema, UpdateTopicSchema } from '../../domain/topics/topic-schema';
/** in-memory 저장소 */
const store = [];
/** seed 데이터를 추가한다 (QA mode 초기화용) */
export function seedTopics(topics) {
    store.length = 0;
    store.push(...topics);
}
export async function createTopic(input) {
    const parsed = CreateTopicSchema.safeParse(input);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
    }
    const { name } = parsed.data;
    const duplicate = store.find((t) => t.name === name && !t.isArchived);
    if (duplicate) {
        return err(ERROR_CODES.VALIDATION_ERROR, '이미 존재하는 주제 이름입니다');
    }
    const now = Date.now();
    const topic = {
        id: crypto.randomUUID(),
        name,
        isArchived: false,
        createdAtMs: now,
        updatedAtMs: now,
    };
    store.push(topic);
    return ok(topic);
}
export async function findAllTopics(includeArchived = false) {
    const result = includeArchived
        ? [...store].sort((a, b) => b.createdAtMs - a.createdAtMs)
        : store.filter((t) => !t.isArchived).sort((a, b) => b.createdAtMs - a.createdAtMs);
    return ok(result);
}
export async function findTopicById(id) {
    const topic = store.find((t) => t.id === id);
    if (!topic) {
        return err(ERROR_CODES.NOT_FOUND, '주제를 찾을 수 없습니다');
    }
    return ok(topic);
}
export async function updateTopic(id, input) {
    const parsed = UpdateTopicSchema.safeParse(input);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
    }
    const { name } = parsed.data;
    const index = store.findIndex((t) => t.id === id);
    if (index === -1) {
        return err(ERROR_CODES.NOT_FOUND, '주제를 찾을 수 없습니다');
    }
    const duplicate = store.find((t) => t.name === name && !t.isArchived && t.id !== id);
    if (duplicate) {
        return err(ERROR_CODES.VALIDATION_ERROR, '이미 존재하는 주제 이름입니다');
    }
    const updated = { ...store[index], name, updatedAtMs: Date.now() };
    store[index] = updated;
    return ok(updated);
}
export async function archiveTopic(id) {
    const index = store.findIndex((t) => t.id === id);
    if (index === -1) {
        return err(ERROR_CODES.NOT_FOUND, '주제를 찾을 수 없습니다');
    }
    if (store[index].isArchived) {
        return err(ERROR_CODES.VALIDATION_ERROR, '이미 아카이브된 주제입니다');
    }
    const updated = { ...store[index], isArchived: true, updatedAtMs: Date.now() };
    store[index] = updated;
    return ok(updated);
}
