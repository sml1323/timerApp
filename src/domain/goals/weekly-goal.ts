/** DB에 저장된 주간 목표의 TypeScript 표현 */
export interface WeeklyGoal {
  id: string;
  topicId: string;
  weekStartAtMs: number;   // 해당 주 월요일 00:00 epoch ms
  targetMinutes: number;   // 양수 정수
  createdAtMs: number;
  updatedAtMs: number;
}

/** 주간 목표 생성 입력 */
export interface CreateWeeklyGoalInput {
  topicId: string;
  weekStartAtMs: number;
  targetMinutes: number;
}

/** 주간 목표 수정 입력 */
export interface UpdateWeeklyGoalInput {
  targetMinutes: number;
}
