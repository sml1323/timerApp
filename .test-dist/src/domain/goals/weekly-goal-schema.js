import { z } from 'zod';
/** 주간 목표 생성 검증 */
export const CreateWeeklyGoalSchema = z.object({
    topicId: z.string().min(1, '주제 ID가 필요합니다'),
    weekStartAtMs: z.number().int().positive('유효한 주 시작 시각이 필요합니다'),
    targetMinutes: z.number().int().min(1, '목표 시간은 1분 이상이어야 합니다'),
});
/** 주간 목표 수정 검증 */
export const UpdateWeeklyGoalSchema = z.object({
    targetMinutes: z.number().int().min(1, '목표 시간은 1분 이상이어야 합니다'),
});
