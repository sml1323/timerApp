import { select, execute } from '../../platform/tauri/sql-client';
import { ok, err } from '../../shared/lib/result';
import { ERROR_CODES } from '../../shared/lib/errors';
import { toTopic } from './topic-mappers';
import { CreateTopicSchema, UpdateTopicSchema } from './topic-schema';
/**
 * 새 주제를 생성한다.
 * - Zod 검증 → 중복 이름 확인 → INSERT → 생성된 row 반환
 */
export async function createTopic(input) {
    try {
        // 1. Zod 입력 검증
        const parsed = CreateTopicSchema.safeParse(input);
        if (!parsed.success) {
            const issue = parsed.error.issues[0];
            return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
        }
        const { name } = parsed.data;
        // 2. 중복 이름 확인 (활성 주제만)
        const duplicates = await select('SELECT id FROM topics WHERE name = $1 AND is_archived = 0', [name]);
        if (duplicates.length > 0) {
            return err(ERROR_CODES.VALIDATION_ERROR, '이미 존재하는 주제 이름입니다');
        }
        // 3. ID 및 타임스탬프 생성
        const id = crypto.randomUUID();
        const now = Date.now();
        // 4. INSERT
        await execute('INSERT INTO topics (id, name, is_archived, created_at_ms, updated_at_ms) VALUES ($1, $2, $3, $4, $5)', [id, name, 0, now, now]);
        // 5. 삽입된 row 조회 후 반환
        const rows = await select('SELECT * FROM topics WHERE id = $1', [id]);
        if (rows.length === 0) {
            return err(ERROR_CODES.PERSISTENCE_ERROR, '주제 생성 후 조회에 실패했습니다');
        }
        return ok(toTopic(rows[0]));
    }
    catch (error) {
        return err(ERROR_CODES.PERSISTENCE_ERROR, `주제 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * 모든 주제를 조회한다.
 * @param includeArchived true면 아카이브된 주제도 포함 (기본값: false)
 */
export async function findAllTopics(includeArchived = false) {
    try {
        const query = includeArchived
            ? 'SELECT * FROM topics ORDER BY created_at_ms DESC'
            : 'SELECT * FROM topics WHERE is_archived = 0 ORDER BY created_at_ms DESC';
        const rows = await select(query);
        const topics = rows.map(toTopic);
        return ok(topics);
    }
    catch (error) {
        return err(ERROR_CODES.PERSISTENCE_ERROR, `주제 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * ID로 주제를 조회한다.
 */
export async function findTopicById(id) {
    try {
        const rows = await select('SELECT * FROM topics WHERE id = $1', [id]);
        if (rows.length === 0) {
            return err(ERROR_CODES.NOT_FOUND, '주제를 찾을 수 없습니다');
        }
        return ok(toTopic(rows[0]));
    }
    catch (error) {
        return err(ERROR_CODES.PERSISTENCE_ERROR, `주제 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * 주제를 수정한다.
 * - Zod 검증 → 존재 확인 → 중복 이름 확인 → UPDATE → 갱신된 row 반환
 */
export async function updateTopic(id, input) {
    try {
        // 1. Zod 입력 검증
        const parsed = UpdateTopicSchema.safeParse(input);
        if (!parsed.success) {
            const issue = parsed.error.issues[0];
            return err(ERROR_CODES.VALIDATION_ERROR, issue?.message ?? '입력값이 올바르지 않습니다');
        }
        const { name } = parsed.data;
        // 2. 존재 확인
        const existResult = await findTopicById(id);
        if (!existResult.ok) {
            return existResult;
        }
        // 3. 중복 이름 확인 (자신 제외, 활성 주제만)
        const duplicates = await select('SELECT id FROM topics WHERE name = $1 AND is_archived = 0 AND id != $2', [name, id]);
        if (duplicates.length > 0) {
            return err(ERROR_CODES.VALIDATION_ERROR, '이미 존재하는 주제 이름입니다');
        }
        // 4. UPDATE
        const now = Date.now();
        await execute('UPDATE topics SET name = $1, updated_at_ms = $2 WHERE id = $3', [name, now, id]);
        // 5. 갱신된 row 조회 후 반환
        const rows = await select('SELECT * FROM topics WHERE id = $1', [id]);
        if (rows.length === 0) {
            return err(ERROR_CODES.PERSISTENCE_ERROR, '주제 수정 후 조회에 실패했습니다');
        }
        return ok(toTopic(rows[0]));
    }
    catch (error) {
        return err(ERROR_CODES.PERSISTENCE_ERROR, `주제 수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * 주제를 아카이브한다.
 */
export async function archiveTopic(id) {
    try {
        // 1. 존재 확인
        const existResult = await findTopicById(id);
        if (!existResult.ok) {
            return existResult;
        }
        // 2. 이미 아카이브 여부 확인
        if (existResult.data.isArchived) {
            return err(ERROR_CODES.VALIDATION_ERROR, '이미 아카이브된 주제입니다');
        }
        // 3. UPDATE
        const now = Date.now();
        await execute('UPDATE topics SET is_archived = 1, updated_at_ms = $1 WHERE id = $2', [now, id]);
        // 4. 갱신된 row 조회 후 반환
        const rows = await select('SELECT * FROM topics WHERE id = $1', [id]);
        if (rows.length === 0) {
            return err(ERROR_CODES.PERSISTENCE_ERROR, '주제 아카이브 후 조회에 실패했습니다');
        }
        return ok(toTopic(rows[0]));
    }
    catch (error) {
        return err(ERROR_CODES.PERSISTENCE_ERROR, `주제 아카이브 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
}
