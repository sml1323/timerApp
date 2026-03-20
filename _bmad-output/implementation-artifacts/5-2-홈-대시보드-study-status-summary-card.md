# Story 5.2: 홈 대시보드 — Study Status Summary Card

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 학습자,
I want 앱을 열면 오늘 진행 상황과 이번 주 목표 대비 진척을 즉시 확인할 수 있기를,
so that 지금 내가 어느 정도 하고 있는지 바로 이해할 수 있다.

## Acceptance Criteria

1. **Given** 홈 화면(`/`)에 접근했을 때 **When** Study Status Summary Card가 표시되면 **Then** 오늘 누적 시간이 표시된다 (FR18)
2. **And** 이번 주 목표 대비 전체 진척률이 표시된다 (FR19)
3. **And** 남은 목표가 표시된다 (UX-DR1)
4. **And** `default.svg` 캐릭터가 현재 상태 보조로 표시된다 (UX-DR4)
5. **And** 데이터 없음 상태에서는 빈 상태 안내가 표시된다 (UX-DR1 — 데이터 없음 state)
6. **And** 메인 화면이 지연 없이 빠르게 표시된다 (NFR1)
7. **And** 진행률은 색상 외 수치/레이블로도 표현된다 (UX-DR11)

## Tasks / Subtasks

- [x] Task 1: 대시보드 서비스 구현 (AC: #1, #2, #3, #6)
  - [x] 1.1 `src/features/dashboard/dashboard-service.ts` 생성 — 통계 + 목표 데이터를 통합 로드
  - [x] 1.2 `loadDashboardData()` 함수 구현 — `getTodayStudySummary`, `getWeeklyStudySummary`, `loadGoalProgressThisWeek` 병렬 호출
  - [x] 1.3 총 주간 목표 분과 달성 분을 집계해 진척률 계산
  - [x] 1.4 남은 목표(분) 계산: `totalTargetMinutes - weeklyActualMinutes` (음수면 0)
  - [x] 1.5 반환 타입 `DashboardData` 정의

- [x] Task 2: 대시보드 훅 구현 (AC: #1, #6)
  - [x] 2.1 `src/features/dashboard/hooks/useDashboardData.ts` 생성
  - [x] 2.2 `useState` + `useEffect` + `useCallback` 패턴 (기존 `useGoalProgress` 참고)
  - [x] 2.3 `isLoading`, `error`, `data`, `refetch` 반환

- [x] Task 3: StudyStatusSummaryCard 컴포넌트 구현 (AC: #1, #2, #3, #4, #5, #7)
  - [x] 3.1 `src/features/dashboard/components/StudyStatusSummaryCard.tsx` 생성
  - [x] 3.2 카드 anatomy: 오늘 누적 시간, 이번 주 누적 시간, 목표 대비 진행률(프로그레스 바 + 수치 레이블), 남은 목표
  - [x] 3.3 `default.svg` 캐릭터 표시 (보조 요소, `aria-hidden="true"` + 텍스트 동반)
  - [x] 3.4 데이터 없음 상태: `default.svg` + "아직 학습 기록이 없어요" 안내 (UX-DR8)
  - [x] 3.5 목표 달성 근접 상태: 진행률 80%+ 시 시각적 강조 (색상 + 레이블)
  - [x] 3.6 목표 달성 상태: 100%+ 시 달성 표시
  - [x] 3.7 진행률은 퍼센트 수치 + "남은 목표 Xh Ym" 텍스트로도 표현 (색상만 의존 금지)
  - [x] 3.8 시간 포맷: 60분 미만이면 `Xm`, 60분 이상이면 `Xh Ym` 형식
  - [x] 3.9 클릭 시 `/stats` 라우트로 이동 (UX-DR1 Interaction Behavior)
  - [x] 3.10 모든 수치에 `aria-label` 또는 `aria-describedby` 제공

- [x] Task 4: StudyStatusSummaryCard 스타일 구현 (AC: #1, #7)
  - [x] 4.1 `src/features/dashboard/components/StudyStatusSummaryCard.module.css` 생성
  - [x] 4.2 기존 디자인 토큰(`tokens.css`) 변수 사용 — 새 CSS 변수 정의 금지
  - [x] 4.3 카드: `--color-bg-elevated`, `--shadow-md`, `--radius-lg`
  - [x] 4.4 프로그레스바: `--color-primary` 기본, `--color-success`(달성), `--color-warning`(근접)
  - [x] 4.5 반응형: Compact Window에서 보조 정보 축소 (캐릭터 영역 숨김 또는 축소)

- [x] Task 5: HomeRoute 통합 (AC: #1, #2, #3, #4, #5, #6, #7)
  - [x] 5.1 `HomeRoute.tsx`에서 `useDashboardData` 훅 호출
  - [x] 5.2 기존 주석 `{/* Study Status Summary Card → Story 5.2에서 구현 */}` 제거
  - [x] 5.3 `<StudyStatusSummaryCard>` 렌더링 — `<h1>` 바로 아래, 주제 선택 섹션 위
  - [x] 5.4 로딩 중 스켈레톤/최소 높이 유지 (레이아웃 시프트 방지)

- [x] Task 6: 빌드 검증 (AC: #6)
  - [x] 6.1 `npx tsc --noEmit` 통과
  - [x] 6.2 `npm run build` 성공
  - [x] 6.3 기존 테스트 회귀 없음

## Dev Notes

### 핵심 기술 요구사항

| 항목 | 상세 |
|------|------|
| 의존 Story | Story 5.1 (통계 도메인 + adapter — **완료됨**) |
| 의존 Story | Story 4.3 (목표 진행 상태 — **완료됨**, `useGoalProgress` + `loadGoalProgressThisWeek` 존재) |
| 도메인 경로 | `src/domain/statistics/` — **이미 구현 완료** (statistics.ts, statistics-repository.ts, statistics-mappers.ts) |
| Adapter 경로 | `src/platform/browser/statistics-adapter.ts` — **이미 구현 완료** |
| Feature 경로 | `src/features/dashboard/` — 현재 `.gitkeep`만 존재. **이 스토리에서 서비스, 훅, 컴포넌트 생성** |
| 상태 관리 | Zustand store 변경 없음. 훅에서 로컬 `useState`로 관리 |
| 라우트 변경 | 없음. HomeRoute.tsx에서 컴포넌트 추가만 |
| 나머지 UI | 기존 `useGoalProgress` 훅은 HomeRoute에서 계속 사용 (목표 요약/주제 패널) |

### 아키텍처 패턴 — 반드시 따를 것

#### 1. Dashboard Service 패턴

기존 `goal-service.ts` 패턴을 따른다. 여러 adapter 함수를 조합해 하나의 통합 데이터를 반환한다:

```typescript
// src/features/dashboard/dashboard-service.ts
import { getTodayStudySummary, getWeeklyStudySummary } from '../../platform/browser/statistics-adapter';
import { loadGoalProgressThisWeek, type GoalProgress } from '../goals/goal-service';
import { getTodayStartAtMs, getWeekStartAtMs } from '../../shared/lib/dates';
import { ok, err, type Result } from '../../shared/lib/result';

export interface DashboardData {
  todayMinutes: number;
  todaySessionCount: number;
  weeklyMinutes: number;
  weeklySessionCount: number;
  totalTargetMinutes: number;     // 이번 주 모든 목표의 합
  weeklyProgressPercent: number;  // 0~100+ (100 초과 가능)
  remainingMinutes: number;       // 남은 목표 분 (0 이상)
  goalCount: number;              // 설정된 목표 수
  achievedGoalCount: number;      // 달성한 목표 수
  hasData: boolean;               // 세션 기록 또는 목표가 하나라도 있는지
}

export async function loadDashboardData(): Promise<Result<DashboardData>> {
  try {
    const todayStartMs = getTodayStartAtMs();
    const weekStartMs = getWeekStartAtMs();

    const [todayResult, weeklyResult, goalResult] = await Promise.all([
      getTodayStudySummary(todayStartMs),
      getWeeklyStudySummary(weekStartMs),
      loadGoalProgressThisWeek(),
    ]);

    if (!todayResult.ok) return todayResult;
    if (!weeklyResult.ok) return weeklyResult;
    if (!goalResult.ok) return goalResult;

    const goals = goalResult.data;
    const totalTargetMinutes = goals.reduce((sum, g) => sum + g.targetMinutes, 0);
    const weeklyMinutes = weeklyResult.data.totalMinutes;
    const weeklyProgressPercent = totalTargetMinutes > 0
      ? Math.round((weeklyMinutes / totalTargetMinutes) * 100)
      : 0;
    const remainingMinutes = Math.max(0, totalTargetMinutes - weeklyMinutes);
    const achievedGoalCount = goals.filter(g => g.isAchieved).length;

    const hasData = todayResult.data.sessionCount > 0
      || weeklyResult.data.sessionCount > 0
      || goals.length > 0;

    return ok({
      todayMinutes: todayResult.data.totalMinutes,
      todaySessionCount: todayResult.data.sessionCount,
      weeklyMinutes,
      weeklySessionCount: weeklyResult.data.sessionCount,
      totalTargetMinutes,
      weeklyProgressPercent,
      remainingMinutes,
      goalCount: goals.length,
      achievedGoalCount,
      hasData,
    });
  } catch (error) {
    return err(
      'UNEXPECTED_ERROR',
      `대시보드 데이터 로드 중 오류: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
```

#### 2. 훅 패턴 (기존 `useGoalProgress` 동일)

```typescript
// src/features/dashboard/hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import { loadDashboardData, type DashboardData } from '../dashboard-service';

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await loadDashboardData();
    if (result.ok) {
      setData(result.data);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
```

#### 3. 컴포넌트 상태 매핑

UX-DR1 정의 기준:

| 상태 | 조건 | 시각적 표현 |
|------|------|-------------|
| 데이터 없음 | `hasData === false` | `default.svg` + "아직 학습 기록이 없어요" 안내 |
| 기본 | `hasData && weeklyProgressPercent < 80` | 프로그레스바 `--color-primary`, 수치 표시 |
| 목표 달성 근접 | `weeklyProgressPercent >= 80 && < 100` | 프로그레스바 `--color-warning` → 격려 문구 |
| 목표 달성 | `weeklyProgressPercent >= 100` | 프로그레스바 `--color-success` + 달성 레이블 |
| 목표 미설정 | `goalCount === 0 && hasData` | 오늘/주간 시간만 표시, 진행률 바 숨김, 목표 설정 안내 텍스트 |

#### 4. 시간 포맷 유틸

기존 `src/shared/lib/` 에 시간 포맷 함수가 없으므로, **컴포넌트 내에 로컬 함수로** 구현한다. 2개 이상 feature에서 재사용 시 `shared/lib/formatters.ts`로 추출 (현재는 이 컴포넌트만 사용):

```typescript
function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
```

#### 5. 캐릭터 자산 사용 패턴

`src/assets/characters/` 디렉터리에 SVG 파일이 위치:

```typescript
import defaultCharacter from '../../../assets/characters/default.svg';
// <img src={defaultCharacter} alt="" aria-hidden="true" />
// 반드시 텍스트 동반 — SVG만으로 의미 전달 금지 (UX-DR4, UX-DR11)
```

#### 6. HomeRoute 통합 시 주의사항

```tsx
// src/app/routes/HomeRoute.tsx 수정 내용
import { useDashboardData } from '../../features/dashboard/hooks/useDashboardData';
import { StudyStatusSummaryCard } from '../../features/dashboard/components/StudyStatusSummaryCard';

// return 안에서:
<section className={styles.homePage}>
  <h1>홈</h1>
  <StudyStatusSummaryCard
    data={dashboardData}
    isLoading={isDashboardLoading}
    error={dashboardError}
  />
  <section aria-label="주제 선택 및 세션 시작" ...>
    {/* 기존 코드 유지 */}
  </section>
</section>
```

⚠️ **기존 `useGoalProgress` 훅 호출은 유지**한다. `useDashboardData`는 Summary Card 전용이고, `useGoalProgress`는 주제 선택 패널의 개별 주제 목표 표시용이다. 중복이 아님.

### 이 스토리에서 생성/수정하는 파일

```text
[NEW] src/features/dashboard/dashboard-service.ts                      — 대시보드 통합 데이터 로드 서비스
[NEW] src/features/dashboard/hooks/useDashboardData.ts                 — 대시보드 데이터 훅
[NEW] src/features/dashboard/components/StudyStatusSummaryCard.tsx      — Summary Card 컴포넌트
[NEW] src/features/dashboard/components/StudyStatusSummaryCard.module.css — Summary Card 스타일
[MODIFY] src/app/routes/HomeRoute.tsx                                  — Summary Card 통합, 주석 제거
[MODIFY] src/app/routes/HomeRoute.module.css                           — Summary Card 영역 스타일 추가 (필요 시)
[DELETE] src/features/dashboard/.gitkeep                               — 실제 파일 생성 후 제거
```

### 명시적으로 수정하지 말아야 할 영역

- `src/domain/statistics/` — Story 5.1에서 완성됨. 수정 불필요
- `src/platform/browser/statistics-adapter.ts` — 이미 완성. 재사용만
- `src/platform/browser/in-memory-statistics-adapter.ts` — 수정 불필요
- `src/features/goals/` — 기존 코드 재사용만. `useGoalProgress`, `loadGoalProgressThisWeek` import만
- `src/features/session/` — 기존 코드 유지
- `src/shared/lib/result.ts`, `errors.ts`, `dates.ts` — 재사용만
- `src/shared/ui/` — 기존 Button, ProgressBar 등 재사용만
- `src/db/migrations/` — 새 테이블/마이그레이션 없음
- `src/features/stats/` — Story 5.3에서 구현

### Anti-Patterns to Avoid

- ❌ 통계 쿼리를 직접 호출 — 반드시 `statistics-adapter.ts`의 위임 함수를 통해서만 접근
- ❌ SQL이나 Tauri plugin을 컴포넌트에서 직접 호출 — adapter/service 경계를 지킬 것
- ❌ `sessions` 테이블을 직접 쿼리하는 새 코드 작성 — 이미 `statistics-repository`에 있음
- ❌ Zustand store에 대시보드 데이터 저장 — 훅에서 로컬 `useState`로 관리
- ❌ 새 CSS 변수 정의 — `tokens.css`의 기존 변수만 사용
- ❌ 캐릭터 SVG에 의미를 단독으로 부여 — 반드시 텍스트 동반, `aria-hidden="true"` on img
- ❌ 진행률을 색상만으로 표현 — 퍼센트 수치 + 남은 시간 텍스트 반드시 포함 (WCAG AA)
- ❌ `useGoalProgress` 훅 제거 — HomeRoute에서 주제 패널 표시용으로 계속 사용
- ❌ `GoalProgress` 타입 직접 재정의 — `goal-service.ts`에서 import
- ❌ `src/features/stats/` 파일 생성 — Story 5.3 범위
- ❌ 프로그레스바를 `<div>` 직기 구현 — `src/shared/ui/ProgressBar/` 가 존재하는지 확인 후, 없으면 간단한 CSS 기반으로 구현 (복잡한 서드파티 라이브러리 도입 금지)

### Previous Story Intelligence

**Story 5.1에서 확인된 패턴 (반드시 재사용):**

- `statistics-adapter.ts` — `getTodayStudySummary(todayStartMs)`, `getWeeklyStudySummary(weekStartAtMs)`, `getStudyByTopic()` 위임 함수 사용
- `dates.ts` — `getTodayStartAtMs()`, `getWeekStartAtMs()` 유틸 사용
- `statistics.ts` 타입 — `TodayStudySummary { totalMinutes, sessionCount }`, `WeeklyStudySummary { totalMinutes, sessionCount }` — 훅에서 활용
- 테스트: `tests/` 디렉터리, `.test.mjs`, `node --test` 러너

**Story 4.3에서 확인된 패턴:**

- `goal-service.ts` — `loadGoalProgressThisWeek()` 반환 타입: `Result<GoalProgress[]>`
- `GoalProgress` — `{ topicId, topicName, targetMinutes, actualMinutes, remainingMinutes, progressPercent, isAchieved }`
- `useGoalProgress` 훅 — `useState + useEffect + useCallback` 패턴, `{ progressList, isLoading, error, refetch }` 반환

**기존 코드 현재 상태:**

- `src/features/dashboard/` — `.gitkeep`만 존재. **이 스토리에서 서비스, 훅, 컴포넌트 생성**
- `src/app/routes/HomeRoute.tsx` (line 67) — `{/* Study Status Summary Card → Story 5.2에서 구현 */}` 주석 존재. **이 주석 제거하고 컴포넌트로 교체**
- `src/shared/ui/ProgressBar/` — 존재 여부 확인 필요. 없으면 카드 내에 간단한 CSS 프로그레스바 구현

### Git Intelligence

최근 주요 커밋:
- `3febfad` (HEAD) — Story 5.1: 통계 도메인/repository/mapper/adapter 구현
- `9124e21` — Story 4.3: 주간 목표 진행 상태 표시
- `e9701b3` — Story 4.2: 목표 설정 UI
- `7f1d18f` — Story 4.1: 주간 목표 도메인

시사점:
- `statistics-adapter.ts` 패턴이 안정화됨 → dashboard-service에서 직접 import
- `useGoalProgress` 훅 패턴이 확립됨 → `useDashboardData`도 동일 패턴
- CSS Modules + tokens.css 변수 사용 패턴이 모든 컴포넌트에서 일관됨

### Project Structure Notes

- Architecture 문서 `src/features/dashboard/` 구조 (line 628-636):
  - `DashboardPage.tsx` — 이 스토리에서는 생성하지 않음 (HomeRoute가 대시보드 역할)
  - `components/StudyStatusSummaryCard.tsx` — **이 스토리에서 생성**
  - `components/WeeklyProgressCard.tsx` — 이 스토리 범위 외
  - `components/CharacterStatePanel.tsx` — 이 스토리 범위 외 (카드 내 인라인 캐릭터로 충분)
  - `hooks/useDashboardData.ts` — **이 스토리에서 생성**
  - `dashboard-service.ts` — **이 스토리에서 생성**

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2, line 552-568]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5, line 532-534]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure, line 628-636 — features/dashboard 위치]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture, line 248-289]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns, line 384-489]
- [Source: _bmad-output/planning-artifacts/architecture.md#Feature Mapping, line 751-754]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Study Status Summary Card, line 317-326]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Character State Panel, line 351-359]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR11 접근성 WCAG AA, line 515-518]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX-DR8 빈 상태, line 483-486]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Strategy, line 499-513]
- [Source: src/domain/statistics/statistics.ts — 통계 도메인 타입]
- [Source: src/platform/browser/statistics-adapter.ts — 런타임 분기 adapter]
- [Source: src/features/goals/goal-service.ts — loadGoalProgressThisWeek, GoalProgress 타입]
- [Source: src/features/goals/hooks/useGoalProgress.ts — 훅 패턴 참고]
- [Source: src/shared/lib/dates.ts — getTodayStartAtMs, getWeekStartAtMs]
- [Source: src/shared/lib/result.ts — Result 타입]
- [Source: src/shared/styles/tokens.css — 디자인 토큰 변수]
- [Source: src/app/routes/HomeRoute.tsx — 현재 홈 화면 코드, line 67 주석]
- [Source: src/app/routes/HomeRoute.module.css — 현재 홈 스타일]

## Dev Agent Record

### Agent Model Used

Antigravity (Claude)

### Debug Log References

- TS6133: 제거된 미사용 `GoalProgress` import
- `node --test tests/` 디렉터리 러너 MODULE_NOT_FOUND는 기존 이슈 (개별 파일 실행 시 모든 테스트 통과)

### Completion Notes List

- ✅ Task 1: `dashboard-service.ts` — `loadDashboardData()` 구현, 통계+목표 데이터 통합. `Promise.all`로 병렬 로드.
- ✅ Task 2: `useDashboardData.ts` — 기존 `useGoalProgress` 패턴 동일하게 `useState+useEffect+useCallback`.
- ✅ Task 3: `StudyStatusSummaryCard.tsx` — 5개 상태 처리 (에러, 로딩, 데이터 없음, 목표 미설정, 데이터 있음). 진행률 색상+수치+텍스트. `aria-label`, `aria-hidden` 적용.
- ✅ Task 4: `StudyStatusSummaryCard.module.css` — `tokens.css` 변수만 사용. 프로그레스바 `data-state` 기반 색상 분기. 반응형(600px 이하 캐릭터 숨김).
- ✅ Task 5: HomeRoute 통합 — `useDashboardData` 훅 + `<StudyStatusSummaryCard>` 추가, 기존 `useGoalProgress` 유지.
- ✅ Task 6: `npx tsc --noEmit` 통과, `npm run build` 성공, 기존 11개 테스트 회귀 없음, 신규 10개 테스트 통과.

### File List

- [NEW] `src/features/dashboard/dashboard-service.ts`
- [NEW] `src/features/dashboard/hooks/useDashboardData.ts`
- [NEW] `src/features/dashboard/components/StudyStatusSummaryCard.tsx`
- [NEW] `src/features/dashboard/components/StudyStatusSummaryCard.module.css`
- [MODIFY] `src/app/routes/HomeRoute.tsx`
- [DELETE] `src/features/dashboard/.gitkeep`
- [NEW] `tests/dashboard-service.test.mjs`

### Change Log

- 2026-03-20: Story 5.2 구현 완료 — 대시보드 서비스, 훅, StudyStatusSummaryCard 컴포넌트/스타일, HomeRoute 통합, 유닛 테스트 10건 추가
- 2026-03-20: AI Code Review 반영 — 접근성을 위해 StudyStatusSummaryCard 루트 `div`를 `button`으로 변경 및 `aria-valuenow`/`aria-valuemax` 계산 방식 개선
