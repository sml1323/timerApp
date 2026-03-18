/** DB에 저장된 주제의 TypeScript 표현 */
export interface Topic {
  id: string;
  name: string;
  isArchived: boolean;
  createdAtMs: number;
  updatedAtMs: number;
}

/** 주제 생성 입력 */
export interface CreateTopicInput {
  name: string;
}

/** 주제 수정 입력 */
export interface UpdateTopicInput {
  name: string;
}
