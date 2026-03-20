# 아키텍처 문서

> 생성일: 2026-03-20 | 프로젝트 타입: Desktop (Tauri 2)

## 1. 개요

bmad_test는 **Tauri 2 + React 19 + TypeScript** 기반의 포모도로 학습 타이머 macOS 데스크톱 앱이다.
오프라인 우선(offline-first), 로컬 데이터 보존, 계정/로그인 불필요의 MVP 원칙을 따른다.

## 2. 아키텍처 패턴

**Feature/Domain 기반 레이어드 아키텍처** (file-type 기반이 아닌 domain 기반 코드 구성)

```
┌─────────────────────────────────────────────────┐
│                   App Layer                      │
│  (router, layout, routes)                        │
├─────────────────────────────────────────────────┤
│                Feature Layer                     │
│  (components, hooks, services per feature)       │
├─────────────────────────────────────────────────┤
│                Domain Layer                      │
│  (types, schemas, repositories, mappers)         │
├─────────────────────────────────────────────────┤
│               Platform Layer                     │
│  (Tauri adapters, browser in-memory adapters)    │
├─────────────────────────────────────────────────┤
│                Shared Layer                      │
│  (Result, errors, dates, UI components, styles)  │
├─────────────────────────────────────────────────┤
│                  DB Layer                        │
│  (bootstrap, migrations, schema DDL)             │
└─────────────────────────────────────────────────┘
```

### 계층 규칙
- **단방향 의존성**: App → Feature → Domain → Platform/Shared → DB
- **Domain은 UI 미의존**: domain 계층은 React 훅이나 컴포넌트를 import하지 않는다
- **Platform 추상화**: 모든 외부 I/O(DB, 알림)는 platform 어댑터를 경유한다
- **Feature 격리**: 각 feature 폴더는 독립적이며, feature 간 직접 import는 최소화한다

## 3. 기술 스택 상세

| 계층 | 기술 | 버전 | 역할 |
|------|------|------|------|
| 네이티브 셸 | Tauri | 2.x | macOS 앱 컨테이너, IPC, 번들링 |
| 프론트엔드 | React | 19.1 | UI 렌더링, Strict Mode |
| 타입 시스템 | TypeScript | 5.8 | strict 모드, noUnusedLocals |
| 번들러 | Vite | 7.x | HMR, 포트 1420, Tauri 연동 |
| 라우팅 | React Router | 7.x | createBrowserRouter, 4개 라우트 |
| 상태 관리 | Zustand | 5.x | 세션 전용 글로벌 store |
| 검증 | Zod | 4.x | 비동기 경계 입력 검증 |
| DB | SQLite | embedded | tauri-plugin-sql, 단일 사실원천 |
| 스타일링 | CSS Modules | — | + CSS Variables (디자인 토큰) |
| 알림 | tauri-plugin-notification | 2.x | 선택적 세션 알림 |

## 4. 데이터 아키텍처

### 4.1 단일 사실원천 원칙
- **SQLite**가 모든 도메인 데이터의 단일 사실원천이다.
- 통계는 `sessions` 테이블에서 **파생 계산**된다 (별도 캐시 테이블 없음).
- 앱 설정은 Tauri Store 플러그인을 사용할 수 있으나, 도메인 레코드는 SQLite에 저장.

### 4.2 테이블 구조
3개 테이블: `topics`, `sessions`, `weekly_goals`
- 모든 PK는 `TEXT` (UUID v4)
- 타임스탬프는 epoch milliseconds (`INTEGER`)
- FK는 `ON DELETE RESTRICT` (실수 삭제 방지)
- DB row는 `snake_case`, TS 객체는 `camelCase` — 매핑은 repository/adapter 경계에서만 수행.

### 4.3 마이그레이션 전략
- forward-only SQL 마이그레이션 (`001_*.sql`, `002_*.sql`, ...)
- `tauri-plugin-sql`이 `Database.load()` 시 자동 실행
- 롤백 미지원 (MVP 범위)

## 5. 상태 관리 전략

### 5.1 Zustand Store
- **sessionStore**: 세션 상태 (phase, status, topicId, timestamps, remaining seconds)
- 파생 셀렉터: `sessionSelectors.ts` — 남은 시간, 상태 판별 등

### 5.2 React Hooks per Feature
각 feature는 자체 custom hook을 통해 데이터를 관리:
- `useTopics()`, `useWeeklyGoals()`, `useDashboardData()`, `useStatistics()`
- `useSessionClock()`, `useTopicSelect()`, `useGoalProgress()`
- `useRecordCorrection()`

### 5.3 데이터 흐름
```
User Action → Hook → Service → Repository → SQLite
                                     ↕
                               Platform Adapter
```

## 6. 비동기 경계 규칙

모든 비동기 경계 함수(repository, service)는 **discriminated result 객체**를 반환한다:
```typescript
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };
```

에러 코드: `VALIDATION_ERROR`, `NOT_FOUND`, `SESSION_STATE_CONFLICT`, `PERSISTENCE_ERROR`, `PERMISSION_DENIED`, `UNEXPECTED_ERROR`

## 7. 런타임 아키텍처

### 7.1 Tauri 런타임 (프로덕션)
```
main.tsx → isTauriRuntime() → initializeDatabase() → RouterProvider
```
- SQLite DB 연결 → 마이그레이션 자동 실행 → 앱 렌더링

### 7.2 브라우저 QA 런타임 (DEV only)
```
main.tsx → !isTauriRuntime() → initializeBrowserQaRuntime() → RouterProvider
```
- 인메모리 어댑터로 동일한 도메인 로직 재현
- 핵심 사용자 흐름(주제 선택 → 세션 시작 → 완료 → 통계)을 브라우저에서 검증 가능

### 7.3 라우트 구조
| 경로 | 레이아웃 | 컴포넌트 | 설명 |
|------|----------|----------|------|
| `/` | AppShell | HomeRoute | 홈 대시보드 |
| `/topics` | AppShell | TopicsRoute | 주제 관리 |
| `/stats` | AppShell | StatsRoute | 통계 + 기록 정정 |
| `/session` | FocusLayout | SessionPage | 집중 모드 타이머 |
| `*` | AppShell | NotFoundRoute | 404 |

## 8. 세션 상태 머신

```
planned → running → completed
                  → interrupted
```
- `planned → running`: 세션 생성 즉시 (MVP 간소화)
- `running → completed`: 타이머 0 도달
- `running → interrupted`: 사용자 중단
- 단일 running 세션 보장: `idx_sessions_single_running` UNIQUE partial index

## 9. 디자인 시스템

### 9.1 디자인 토큰 (`tokens.css`)
- **색상**: 저채도 블루/틸 중심 (`--color-primary`, `--color-accent`)
- **타이포그래피**: 시스템 산세리프 폰트
- **스페이싱**: 8px 기반 (`--space-1` ~ `--space-12`)
- **다크 모드**: CSS Variables 기반으로 확장 가능

### 9.2 컴포넌트 스타일링
- CSS Modules: 컴포넌트 스코프 스타일, `*.module.css`
- 전역 스타일: `globals.css` (리셋, 기본 타이포)
- 유틸리티: `utilities.css` (보조 유틸 클래스)

### 9.3 레이아웃
- **AppShell**: 기본 레이아웃 + 메인 내비게이션
- **FocusLayout**: 세션 집중 모드 (내비게이션 축소)
- 반응형: Wide Desktop / Standard Desktop / Compact Window 대응

## 10. 테스트 전략

- **테스트 프레임워크**: ESM 기반 (`.mjs` 확장자)
- **테스트 위치**: `tests/` 디렉터리 (프로젝트 루트)
- **테스트 인프라**: `test-ipc.mjs`, `test-load.mjs`, `test-mock.mjs`
- **인메모리 어댑터**: 브라우저 어댑터를 활용한 DB-free 테스트
- **커버리지 영역**: 서비스(dashboard, session, statistics, goal), 도메인(mappers, schema, repository), 기록 정정, 통계 재계산

## 11. 접근성 (WCAG AA)

- 텍스트/배경 대비 확보
- 키보드 포커스 링 (`focus-visible`)
- 키보드 전체 탐색 가능 (주제 선택 방향키/Enter)
- VoiceOver 대응 (ARIA 속성)
- 색상만으로 상태 전달 금지 (텍스트 동반)
