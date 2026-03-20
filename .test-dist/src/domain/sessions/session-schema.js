import { z } from 'zod';
/** 세션 생성 검증 — topicId, phaseType, plannedDurationSec */
export const CreateSessionSchema = z.object({
    topicId: z.string().min(1, '주제를 선택해주세요'),
    phaseType: z.enum(['study', 'break'], { message: '유효하지 않은 세션 유형입니다' }),
    plannedDurationSec: z.number().int().positive('세션 시간은 양의 정수여야 합니다'),
});
/** 세션 완료 검증 */
export const CompleteSessionSchema = z.object({
    sessionId: z.string().min(1, '세션 ID가 필요합니다'),
});
/** 세션 중단 검증 */
export const InterruptSessionSchema = z.object({
    sessionId: z.string().min(1, '세션 ID가 필요합니다'),
});
