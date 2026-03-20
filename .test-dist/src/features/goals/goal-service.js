import { createWeeklyGoal, updateWeeklyGoal, findByTopicAndWeek, findAllByWeek } from '../../platform/browser/goal-adapter';
import { getWeeklyStudyMinutesByTopic } from '../../platform/browser/session-adapter';
import { findAllTopics } from '../../platform/browser/topic-adapter';
import { getWeekStartAtMs } from '../../shared/lib/dates';
import { ok } from '../../shared/lib/result';
/** 현재 주의 특정 주제 목표 조회 */
export async function loadGoalForTopicThisWeek(topicId) {
    const weekStartAtMs = getWeekStartAtMs();
    return findByTopicAndWeek(topicId, weekStartAtMs);
}
/** 목표 저장 (신규이면 create, 기존이면 update) */
export async function saveGoal(topicId, targetMinutes) {
    const weekStartAtMs = getWeekStartAtMs();
    const existing = await findByTopicAndWeek(topicId, weekStartAtMs);
    if (!existing.ok)
        return existing;
    if (existing.data) {
        return updateWeeklyGoal(existing.data.id, { targetMinutes });
    }
    return createWeeklyGoal({ topicId, weekStartAtMs, targetMinutes });
}
/** 현재 주의 모든 목표 조회 */
export async function loadAllGoalsThisWeek() {
    const weekStartAtMs = getWeekStartAtMs();
    return findAllByWeek(weekStartAtMs);
}
/** 현재 주의 모든 목표 대비 진행 상태 조회 */
export async function loadGoalProgressThisWeek() {
    const weekStartAtMs = getWeekStartAtMs();
    // 1. 이번 주 목표 전체 조회
    const goalsResult = await findAllByWeek(weekStartAtMs);
    if (!goalsResult.ok)
        return goalsResult;
    const goals = goalsResult.data;
    if (goals.length === 0)
        return ok([]);
    // 2. 이번 주 주제별 학습 시간 집계
    const studyResult = await getWeeklyStudyMinutesByTopic(weekStartAtMs);
    if (!studyResult.ok)
        return studyResult;
    const studyMap = studyResult.data;
    // 3. 주제 이름 맵 구성
    const topicsResult = await findAllTopics();
    if (!topicsResult.ok)
        return topicsResult;
    const topicNameMap = new Map();
    for (const topic of topicsResult.data) {
        topicNameMap.set(topic.id, topic.name);
    }
    // 4. GoalProgress 계산
    const progressList = goals.map((goal) => {
        const actualMinutes = studyMap.get(goal.topicId) ?? 0;
        const targetMinutes = goal.targetMinutes;
        const remainingMinutes = Math.max(0, targetMinutes - actualMinutes);
        const progressPercent = targetMinutes > 0
            ? Math.min(100, Math.round((actualMinutes / targetMinutes) * 100))
            : 0;
        return {
            topicId: goal.topicId,
            topicName: topicNameMap.get(goal.topicId) ?? '',
            targetMinutes,
            actualMinutes,
            remainingMinutes,
            progressPercent,
            isAchieved: actualMinutes >= targetMinutes,
        };
    });
    return ok(progressList);
}
