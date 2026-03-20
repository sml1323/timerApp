# 컴포넌트 인벤토리

> 생성일: 2026-03-20 | 총 컴포넌트: 27개 (공용 1 + 기능별 26)

## 공용 UI 컴포넌트 (`src/shared/ui/`)

| 컴포넌트 | 파일 | 설명 | Variants |
|----------|------|------|----------|
| Button | `Button.tsx` | 공용 버튼 | Primary, Secondary, Text, Destructive |

## 레이아웃 컴포넌트 (`src/app/layout/`)

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| AppShell | `AppShell.tsx` | 메인 내비게이션 포함 기본 레이아웃 |
| FocusLayout | `FocusLayout.tsx` | 세션 집중 모드 (내비게이션 축소) |
| MainNavigation | `MainNavigation.tsx` | 네비게이션 바 (홈/주제/통계) |

## 라우트 컴포넌트 (`src/app/routes/`)

| 컴포넌트 | 파일 | 라우트 | 설명 |
|----------|------|--------|------|
| HomeRoute | `HomeRoute.tsx` | `/` | 홈 대시보드 |
| TopicsRoute | `TopicsRoute.tsx` | `/topics` | 주제 관리 페이지 |
| StatsRoute | `StatsRoute.tsx` | `/stats` | 통계 + 기록 목록 |
| NotFoundRoute | `NotFoundRoute.tsx` | `*` | 404 페이지 |

## 기능별 컴포넌트

### Dashboard (`src/features/dashboard/`)

| 컴포넌트 | 파일 | 설명 | 상태(States) |
|----------|------|------|-------------|
| StudyStatusSummaryCard | `StudyStatusSummaryCard.tsx` | 홈 화면 학습 요약 카드 | 기본, 목표 달성 근접, 목표 달성, 데이터 없음 |

**서비스:**
- `dashboard-service.ts` — 대시보드 데이터 집계

**훅:**
- `useDashboardData.ts` — 대시보드 데이터 로딩

---

### Goals (`src/features/goals/`)

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| GoalProgressInline | `GoalProgressInline.tsx` | 목표 진행률 인라인 표시 |
| GoalSettingsDialog | `GoalSettingsDialog.tsx` | 목표 설정 다이얼로그 |

**서비스:**
- `goal-service.ts` — 목표 비즈니스 로직

**훅:**
- `useGoalProgress.ts` — 목표 진행률 계산
- `useWeeklyGoals.ts` — 주간 목표 CRUD

---

### Records (`src/features/records/`)

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| RecordList | `RecordList.tsx` | 세션 기록 목록 |
| RecordCorrectionDialog | `RecordCorrectionDialog.tsx` | 기록 주제 수정 다이얼로그 |
| CorrectionFeedback | `CorrectionFeedback.tsx` | 수정 완료 피드백 (`speak.svg`) |

**서비스:**
- `record-correction-service.ts` — 기록 정정 + 통계 재계산

**훅:**
- `useRecordCorrection.ts` — 기록 정정 상태 관리

---

### Session (`src/features/session/`)

| 컴포넌트 | 파일 | 설명 | 상태(States) |
|----------|------|------|-------------|
| SessionPage | `SessionPage.tsx` | 세션 페이지 (집중 모드 최상위) | — |
| TopicQuickSelectPanel | `TopicQuickSelectPanel.tsx` | 주제 빠른 선택 패널 | 주제 있음, 빈 상태 |
| SessionFocusTimer | `SessionFocusTimer.tsx` | 포모도로 타이머 | 진행 중, 완료 직전, 완료 |
| SessionOutcomePanel | `SessionOutcomePanel.tsx` | 세션 결과 패널 | success, recovery |
| CharacterStatePanel | `CharacterStatePanel.tsx` | 캐릭터 상태 패널 | default, loading, speak |

**서비스:**
- `session-service.ts` — 세션 생성/완료/중단
- `session-flow.ts` — 세션 플로우 오케스트레이션

**훅:**
- `useSessionClock.ts` — 타이머 인터벌 (timestamp 기반)
- `useTopicSelect.ts` — 주제 선택 상태

**상태 관리:**
- `sessionStore.ts` — Zustand 글로벌 store
- `sessionSelectors.ts` — 파생 셀렉터

---

### Stats (`src/features/stats/`)

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| StatsSummaryCard | `StatsSummaryCard.tsx` | 통계 요약 카드 (오늘/주간) |
| TopicBreakdownList | `TopicBreakdownList.tsx` | 주제별 통계 목록 |

**서비스:**
- `statistics-service.ts` — 통계 데이터 조회

**훅:**
- `useStatistics.ts` — 통계 데이터 로딩

---

### Topics (`src/features/topics/`)

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| TopicsPage | `TopicsPage.tsx` | 주제 관리 페이지 (최상위) |
| TopicCard | `TopicCard.tsx` | 주제 카드 |
| TopicForm | `TopicForm.tsx` | 주제 생성/수정 폼 |
| TopicList | `TopicList.tsx` | 주제 목록 |

**서비스:**
- `topic-service.ts` — 주제 비즈니스 로직

**훅:**
- `useTopics.ts` — 주제 CRUD + 상태

## 디자인 시스템 요소

### 스타일 파일 (`src/shared/styles/`)

| 파일 | 역할 |
|------|------|
| `tokens.css` | 디자인 토큰 (색상, 타이포, 스페이싱) |
| `globals.css` | 전역 리셋, 기본 타이포 |
| `utilities.css` | 보조 유틸리티 CSS 클래스 |

### CSS Modules 사용 패턴
모든 기능 컴포넌트가 `*.module.css` 파일을 동반:
- 총 **20개** CSS Module 파일
- `cn()` 유틸로 조건부 클래스 결합

### 캐릭터 에셋 (`src/assets/characters/`)

| 파일 | 용도 | 사용 컨텍스트 |
|------|------|-------------|
| `default.svg` | 홈/대기 상태 | StudyStatusSummaryCard, 빈 상태 |
| `loading.svg` | 세션 진행 중 | SessionFocusTimer, 집중 모드 |
| `speak.svg` | 완료/피드백 | SessionOutcomePanel, CorrectionFeedback |
