import { z } from 'zod';

/** 세션 생성 검증 — topicId, phaseType, plannedDurationSec */
export const CreateSessionSchema = z.object({
  topicId: z.string().min(1, 'Please select a topic'),
  phaseType: z.enum(['study', 'break'], { message: 'Invalid session type' }),
  plannedDurationSec: z.number().int().positive('Session duration must be a positive integer'),
});

/** 세션 완료 검증 */
export const CompleteSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

/** 세션 중단 검증 */
export const InterruptSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

/** 세션 주제 재할당 검증 */
export const ReassignSessionTopicSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  newTopicId: z.string().min(1, 'Topic ID is required'),
});
