import { z } from 'zod';

/** 주간 목표 생성 검증 */
export const CreateWeeklyGoalSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
  weekStartAtMs: z.number().int().positive('A valid week start time is required'),
  targetMinutes: z.number().int().min(1, 'Target minutes must be at least 1'),
});

/** 주간 목표 수정 검증 */
export const UpdateWeeklyGoalSchema = z.object({
  targetMinutes: z.number().int().min(1, 'Target minutes must be at least 1'),
});
