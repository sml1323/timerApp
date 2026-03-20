/** 오늘 학습 요약 */
export interface TodayStudySummary {
  totalMinutes: number;       // 오늘 study 세션 누적 분
  sessionCount: number;       // 오늘 완료 study 세션 수
}

/** 주간 학습 요약 */
export interface WeeklyStudySummary {
  totalMinutes: number;       // 이번 주 study 세션 누적 분
  sessionCount: number;       // 이번 주 완료 study 세션 수
}

/** 주제별 누적 학습 시간 */
export interface TopicStudySummary {
  topicId: string;
  topicName: string;
  totalMinutes: number;       // 해당 주제 전체 기간 study 누적 분
  sessionCount: number;       // 해당 주제 전체 세션 수
}

/** 통합 통계 뷰 */
export interface StudyStatistics {
  today: TodayStudySummary;
  weekly: WeeklyStudySummary;
  byTopic: TopicStudySummary[];
}
