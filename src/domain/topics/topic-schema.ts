import { z } from 'zod';

/** 주제 생성 검증 — trim 후 1자 이상 */
export const CreateTopicSchema = z.object({
  name: z.string().trim().min(1, '주제 이름을 입력해주세요'),
});

/** 주제 수정 검증 */
export const UpdateTopicSchema = z.object({
  name: z.string().trim().min(1, '주제 이름을 입력해주세요'),
});
