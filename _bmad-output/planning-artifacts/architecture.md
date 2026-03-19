---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - /Users/imseungmin/work/bmad_test/_bmad-output/planning-artifacts/product-brief-bmad_test-2026-03-15.md
  - /Users/imseungmin/work/bmad_test/_bmad-output/planning-artifacts/prd.md
  - /Users/imseungmin/work/bmad_test/_bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'architecture'
project_name: 'bmad_test'
user_name: 'Imseungmin'
date: '2026-03-17'
lastStep: 8
status: 'complete'
completedAt: '2026-03-17'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
이 프로젝트는 총 39개의 기능 요구사항을 포함하며, 크게 학습 세션 관리, 주제 관리, 목표 관리, 오늘 진행 상황 및 통계, 기록 정정, 내비게이션, 로컬 데이터 보존, 데스크톱 보조 기능으로 나뉜다. 아키텍처 관점에서 가장 중요한 기능 흐름은 사용자가 홈에서 현재 상태를 확인하고, 주제를 선택해 포모도로 세션을 시작하며, 종료 후 기록과 통계가 자동 반영되고, 필요 시 기록을 정정하는 루프다. 특히 세션 기록은 신뢰 가능한 단일 사실원천으로 취급되어야 하며, 주제/목표/통계는 모두 이 기록에서 일관되게 파생되어야 한다.

**Non-Functional Requirements:**
핵심 비기능 요구사항은 빠른 앱 반응성, 오프라인 동작, 로컬 데이터 보존, 타이머 정확성, 통계 계산 일관성, 기본 macOS 접근성 준수다. 앱은 로그인과 클라우드 의존 없이 동작해야 하며, 재실행 이후에도 세션 기록과 목표 데이터가 보존되어야 한다. 세션 완료 후 즉시 저장과 즉시 통계 반영이 필요하고, 기록 불일치나 데이터 손실은 제품 신뢰를 직접 훼손한다.

**Scale & Complexity:**
프로젝트는 단일 사용자용 macOS 앱이므로 인프라 차원의 대규모 복잡성은 낮지만, 상태 관리와 데이터 일관성 측면의 제품 복잡성은 중간 수준이다. 실시간 협업, 멀티테넌시, 외부 플랫폼 연동, 고규제 요구는 없지만, 세션 생명주기와 기록 정정, 목표 대비 진행률 계산, 회복 UX가 맞물려 있어 도메인 규칙을 명확히 분리한 구조가 필요하다.

- Primary domain: macOS desktop app / local-first productivity client
- Complexity level: medium
- Estimated architectural components: 7

### Technical Constraints & Dependencies

이 프로젝트는 macOS 단일 플랫폼을 전제로 하며, MVP에서는 웹/모바일/Windows 확장을 고려하지 않는다. 핵심 데이터는 모두 로컬 저장소에 보존되어야 하고, 네트워크 연결 없이도 세션 실행, 기록 저장, 목표 추적, 통계 조회가 가능해야 한다. 로그인, 서버 백엔드, 클라우드 동기화는 MVP 범위 밖이다. macOS 알림은 보조 기능으로 고려할 수 있으나, 핵심 흐름이 알림 의존적으로 설계되어서는 안 된다. UX 문서상 `default.svg`, `loading.svg`, `speak.svg` 캐릭터 상태는 인터페이스 의미 체계의 일부이므로, 상태 전환과 텍스트 피드백 구조가 아키텍처적으로도 일관되게 지원되어야 한다.

### Cross-Cutting Concerns Identified

- 세션 상태 전이의 일관성: 시작, 진행 중, 중단, 완료, 휴식 전환
- 타이머 정확성과 앱 생명주기 처리: 백그라운드, 재실행, 인터럽트
- 로컬 영속성 모델: 주제, 목표, 세션 기록, 주간 집계
- 통계 재계산 규칙: 세션 완료 직후 반영, 기록 정정 후 재반영
- 회복 중심 UX 지원: 목표 미달과 중단 상황에서도 실패감 대신 재시작 가능성 제공
- 접근성 및 키보드 탐색: 핵심 루프 전반에서 보장 필요
- 상태 표현 규칙: 캐릭터 상태와 실제 시스템 상태 의미를 혼동 없이 유지

## Starter Template Evaluation

### Primary Technology Domain

Desktop application based on project requirements analysis, with a local-first architecture and a component-heavy user interface.

### Starter Options Considered

1. Tauri 2 + `create-tauri-app` + React + TypeScript  
공식 템플릿이 존재하고, 데스크톱 앱에 필요한 네이티브 통합과 경량 배포 구조를 제공한다. 이 프로젝트처럼 오프라인 중심, 로컬 저장 중심, macOS 전용 우선 전략에 잘 맞는다. UX 요구사항상 상태가 많은 화면과 재사용 가능한 컴포넌트가 필요하므로 React + TypeScript 조합이 적합하다.

2. Electron Forge + `vite-typescript`  
공식 스타터와 빌드 파이프라인은 성숙하지만, 공식 문서 기준으로 Vite 지원은 `v7.5.0` 시점부터 experimental로 표시되어 있다. 또한 React는 별도 통합 단계가 필요해 초기 아키텍처 결정 수가 늘어난다. 이 프로젝트에서는 시작점 단순성이 Tauri 쪽보다 떨어진다.

3. Wails v2 + React  
공식 React 템플릿이 존재하고 데스크톱 앱 개발도 가능하다. 다만 Go 툴체인을 추가로 관리해야 하고, 현재 요구사항에서는 Tauri 대비 더 나은 적합성이 명확하지 않다. 팀이 Go 중심이거나 시스템 로직을 Go로 강하게 가져갈 계획이 아니라면 우선순위가 낮다.

### Selected Starter: Tauri 2 + React + TypeScript

**Rationale for Selection:**
이 프로젝트는 macOS 전용 학습 운영 앱으로, 빠른 실행, 작은 배포 부담, 로컬 우선 저장, 네이티브 알림 연계 가능성, 컴포넌트 중심 UI가 모두 중요하다. Tauri는 공식적으로 다양한 프론트엔드와 결합 가능하며, 공식 문서가 SPA 프레임워크에는 Vite를 권장한다. 또한 공식 `create-tauri-app`가 React 템플릿을 직접 제공하므로 초기 설정 비용이 낮다. Electron 대비 런타임 부담이 작고, Wails 대비 추가 언어 전환 비용이 적어 현재 프로젝트에 가장 균형이 좋다.

**Initialization Command:**

```bash
npm create tauri-app@latest
```

Prompt selections:
- Frontend language: `TypeScript / JavaScript`
- Package manager: `npm`
- UI template: `React`
- UI flavor: `TypeScript`

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
프론트엔드는 TypeScript 기반 React, 네이티브 앱 셸은 Tauri 2와 Rust 기반으로 구성된다.

**Styling Solution:**
스타터가 특정 디자인 시스템을 강제하지 않으므로, 이후 단계에서 CSS Modules, plain CSS, Tailwind 중 하나를 선택할 수 있다. 현재 단계에서는 스타일링 결정을 열어두는 편이 좋다.

**Build Tooling:**
Tauri 공식 흐름과 Vite 기반 프론트엔드 개발 서버를 사용한다. 개발 시 `tauri dev`, 배포 시 Tauri 번들링 파이프라인을 따른다.

**Testing Framework:**
스타터 자체가 강한 테스트 체계를 고정하지 않으므로, UI 테스트와 도메인 테스트 전략은 별도로 정의한다. 제품 runtime은 Tauri를 기준으로 유지하되, 핵심 Home / Session 흐름의 빠른 회귀 확인을 위해 브라우저 기반 internal QA harness 또는 mock runtime을 둘 수 있다. 이 경로는 사용자 제공 플랫폼이 아니라 검증 도구이며, Tauri runtime과 동일한 service / state 흐름을 최대한 재사용해야 한다.

**Code Organization:**
웹 UI 계층과 Tauri/Rust 계층이 분리된 구조를 기본으로 삼는다. 이는 화면 상태 관리, 로컬 저장 추상화, 타이머 도메인 로직, 통계 계산 로직을 명확히 분리하기 좋다.

**Development Experience:**
컴포넌트 개발은 React/Vite 흐름으로 빠르게 반복 가능하고, 데스크톱 동작은 Tauri 개발 서버로 검증할 수 있다. 또한 Tauri native API가 없는 환경에서도 핵심 Home / Session 플로우를 확인할 수 있도록 browser QA harness를 둘 수 있다. native persistence / notification 검증은 Tauri runtime에서 계속 수행하고, browser harness는 UI 흐름과 상태 전이 회귀 확인에 한정한다.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Domain persistence uses embedded SQLite as the primary source of truth.
- Timer/session state is modeled with timestamps, not incrementing counters.
- MVP has no authentication or authorization layer.
- Native communication uses Tauri capabilities/plugins and thin typed wrappers, not REST/GraphQL.
- Frontend uses React 19.x + TypeScript with route-based navigation and a small explicit global state layer.

**Important Decisions (Shape Architecture):**
- Validation uses Zod 4.x on the TypeScript boundary, with DB constraints enforcing final integrity.
- Lightweight app settings use Tauri Store; domain records stay in SQLite.
- Styling uses CSS Modules + CSS variables, not a utility-first framework.
- CI uses GitHub Actions with separate validation and desktop build jobs.

**Deferred Decisions (Post-MVP):**
- Encryption at rest
- Cloud sync / backup
- Auto-updater
- Telemetry / crash reporting
- Multi-window or tray/menu-bar architecture
- External API integrations

### Data Architecture

**Primary Database:**
- Embedded SQLite
- Access pattern: local-first, single-user, single-app database
- Rationale: topic/goal/session/statistics data is relational, queryable, and must survive app restarts reliably

**Persistence Technology:**
- Tauri SQL plugin with SQLite engine enabled
- Version line: Tauri 2.x plugin ecosystem
- Rationale: official Tauri path, built-in migrations support, AppConfig-relative DB path, and permission-scoped access model

**Data Modeling Approach:**
- `topics` table for learning subjects
- `weekly_goals` table for topic-level weekly targets
- `sessions` table as the canonical event log
- `session_status` modeled explicitly: planned / running / completed / interrupted / cancelled as needed
- Statistics are derived from session records, not stored as mutable truth

**Timer Modeling Decision:**
- The timer source of truth is timestamp-based
- Store `started_at`, `planned_duration_sec`, `ended_at`, `phase_type`, `topic_id`
- Remaining time is derived from current wall clock and persisted timestamps
- Rationale: this avoids interval drift, survives background throttling better, and recovers cleanly after relaunch

**Validation Strategy:**
- Zod 4.x for form input and boundary validation in the frontend
- SQLite constraints for final data integrity
- Domain invariants enforced before write operations
- Examples: non-empty topic name, positive goal minutes, legal session transitions, editable fields restricted to topic reassignment only

**Migration Approach:**
- Forward-only SQL migrations registered at app startup
- Migrations are versioned and committed with the codebase
- Rationale: schema evolution must stay deterministic for AI-assisted implementation

**Caching Strategy:**
- No separate cache layer in MVP
- SQLite is the source of truth for persisted entities
- In-memory state is only for active UI/session state
- Rationale: separate caching would add invalidation complexity without enough scale benefit

**Lightweight Settings Storage:**
- Tauri Store plugin for small preference/state items only
- Use cases: selected theme later, window/UI preferences, last selected topic if needed
- Do not store core study records in Store

### Authentication & Security

**Authentication Method:**
- No authentication in MVP
- Rationale: the app is single-user, local-first, and has no account system

**Authorization Pattern:**
- No user-role authorization in MVP
- Native access is constrained by Tauri capabilities, not app-level roles

**Security Boundary:**
- Explicit Tauri capability files with least-privilege permissions
- Enable only the plugins and scopes actually needed
- Rationale: Tauri’s capability model is designed to constrain frontend exposure to native functionality

**Data Protection Approach:**
- Store app data in app-specific local directories
- No encryption-at-rest in MVP
- Rationale: study logs are not high-sensitivity secrets, and encryption would add operational complexity early
- Revisit if cloud sync, multi-device, or sensitive exports are added later

**Content Loading Policy:**
- No remote scripts or CDN assets
- Bundled local assets only
- Rationale: aligns with Tauri CSP guidance and reduces webview attack surface

**Notification Security Pattern:**
- Notifications are optional support behavior, not a core dependency
- Request notification permission only when first needed
- Keep notification payloads simple and local

### API & Communication Patterns

**Primary Communication Pattern:**
- No REST or GraphQL layer in MVP
- Communication is local only: React app <-> Tauri plugin/native boundary

**Boundary Design:**
- Create thin typed adapter modules in the frontend for:
  - runtime detection / bootstrap
  - database or in-memory persistence access
  - notification access
  - future native integrations
- UI components must not call plugin APIs directly
- Tauri-specific adapters and browser QA adapters must be selected behind a narrow runtime seam

**Error Handling Standard:**
- Use domain error categories, not raw driver/plugin messages in UI
- Categories: validation error, persistence error, session state conflict, permission error, unexpected system error

**Session Update Pattern:**
- Writes are explicit commands
- Reads are screen-focused queries
- Stats are recomputed from persisted records after write completion
- Rationale: makes recalculation consistent after session completion or topic correction

**Rate Limiting Strategy:**
- Not applicable in MVP
- No remote public API exists

### Frontend Architecture

**Framework Stack:**
- React 19.x
- Vite 7.x
- TypeScript
- Rationale: current stable modern stack with strong ecosystem support and excellent fit for component-heavy local apps

**Routing Strategy:**
- React Router 7.x
- Initial routes:
  - `/` home/dashboard
  - `/topics`
  - `/stats`
  - modal/detail flows layered on top as needed
- Rationale: even with a small app, explicit route structure keeps navigation stable and extensible

**State Management:**
- Zustand 5.x for app/session/UI state
- Keep global state small: active session, selected topic, transient UI flags
- Persisted entities should be re-read from SQLite instead of duplicated broadly in client state
- Rationale: simple mental model and lower ceremony than larger state frameworks

**Component Architecture Decision:**
- Domain-oriented feature modules
- Split by user-facing capability, not by file type alone
- Expected top-level areas:
  - app shell
  - session
  - topics
  - goals
  - statistics
  - shared ui
- Detailed structure will be finalized in the implementation patterns step

**Styling Strategy:**
- CSS Modules + CSS variables/design tokens
- Rationale: supports bespoke desktop UI without utility-class sprawl and keeps component styling explicit

**Performance Strategy:**
- Compute heavy aggregations in SQL queries where practical
- Avoid large client-side recomputation over full session history on every render
- Keep active timer rendering isolated from broader dashboard rerenders

### Infrastructure & Deployment

**Target Platforms:**
- macOS first
- No web deployment
- No Windows/mobile commitment in MVP

**CI/CD Approach:**
- GitHub Actions
- Separate jobs for:
  - install + typecheck + lint + tests
  - desktop build validation
- Release packaging can start manual/semi-manual before full automation

**Environment Configuration:**
- Minimal environment surface
- Prefer build-time config and local app config files over many environment variables
- Rationale: no backend or cloud stack exists in MVP

**Logging Strategy:**
- Development logging in frontend and Tauri side
- Production diagnostic logging kept minimal in MVP
- Telemetry deferred

**Scaling Strategy:**
- Architectural scaling focus is codebase maintainability, not infrastructure scale
- Single-user local performance is the primary target

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialize Tauri 2 + React + TypeScript project
2. Configure SQLite and migrations
3. Define session/topic/goal schema
4. Build typed persistence adapters
5. Implement session state model and timer derivation logic
6. Implement home/topics/stats routes
7. Add topic correction and stats recalculation flow
8. Add optional notification integration

**Cross-Component Dependencies:**
- Timer UX depends on timestamp-based session model
- Statistics correctness depends on session table integrity
- Topic correction depends on recomputation rules, not mutable summary tables
- Notification behavior depends on session lifecycle and permission handling
- Route structure and state boundaries influence how easily AI agents can implement screens consistently

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
12 areas where AI agents could make different choices and cause integration conflicts

### Naming Patterns

**Database Naming Conventions:**
- Tables use plural `snake_case`
- Examples: `topics`, `weekly_goals`, `sessions`
- Primary key is always `id`
- Foreign keys always use `<entity>_id`
- Timestamp columns use `<event>_at_ms` for persisted epoch-millisecond fields
- Boolean columns use `is_` / `has_` prefixes when semantically appropriate
- Indexes use `idx_<table>_<column>[_<column>]`
- Examples:
  - `idx_sessions_topic_id_started_at_ms`
  - `idx_weekly_goals_topic_id_week_start_at_ms`

**API Naming Conventions:**
- No REST API in MVP
- Tauri command names use `snake_case`
- Frontend adapter function names use `camelCase`
- Route paths use lowercase plural nouns
- Examples:
  - command: `create_topic`, `start_session`, `reassign_session_topic`
  - adapter: `createTopic()`, `startSession()`
  - routes: `/`, `/topics`, `/stats`

**Code Naming Conventions:**
- React components: `PascalCase`
- Component files: `PascalCase.tsx`
- Hooks: `useCamelCase`
- Utility files: `camelCase.ts` only for hook-like modules, otherwise `kebab-case.ts` for non-component files
- Feature directories: lowercase or `kebab-case`
- Variables/functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/interfaces/schemas: `PascalCase`
- Examples:
  - `StudyStatusCard.tsx`
  - `useActiveSession.ts`
  - `session-repository.ts`
  - `SESSION_PHASES`

### Structure Patterns

**Project Organization:**
- Organize by feature/domain first, not by file type first
- UI, state, validation, and adapters for one domain stay close together
- Shared primitives go to shared UI/lib layers only when reused by 2+ features
- Database access never happens inside page or component files
- Tauri/plugin access is wrapped in adapter/repository modules only
- Statistics queries and session write logic must not be duplicated across screens

**File Structure Patterns:**
- Tests are co-located with source using `*.test.ts` / `*.test.tsx`
- SQL migrations live in one numbered migrations directory
- Static SVG assets keep original file names and live in a single asset area
- Architecture/spec docs stay under planning artifacts, not mixed into source
- Environment/config files stay at app root or native root only, never inside features

### Format Patterns

**API Response Formats:**
- Internal async boundaries return a discriminated result shape
- Success format:
  - `{ ok: true, data }`
- Failure format:
  - `{ ok: false, code, message, details? }`
- UI code must branch on `ok`, not inspect raw plugin errors
- Do not return naked arrays or primitives from adapter boundaries

**Data Exchange Formats:**
- TypeScript objects use `camelCase`
- SQLite columns use `snake_case`
- Mapping between DB rows and TS objects happens at the repository/adapter boundary only
- Persisted timestamps use Unix epoch milliseconds
- UI formatting converts timestamps at the presentation layer only
- Nullability is explicit; avoid `undefined | null` drift for persisted entities
- Single-item operations return objects, not one-element arrays

### Communication Patterns

**Event System Patterns:**
- Avoid a generic event bus in MVP unless a native integration genuinely requires it
- If events are introduced, use lowercase dot notation
- Event name examples:
  - `session.started`
  - `session.completed`
  - `session.interrupted`
  - `stats.recomputed`
- Event payload shape:
  - `{ eventVersion, occurredAtMs, payload }`
- Do not emit anonymous string payloads

**State Management Patterns:**
- Zustand stores use immutable updates
- Store names are noun-based: `sessionStore`, `topicStore`, not vague names like `appStore` unless truly global
- Actions use verbNoun naming
- Examples:
  - `startSession`
  - `interruptSession`
  - `selectTopic`
  - `openCorrectionDialog`
- Selectors live close to the store and are reused through hooks
- Persisted domain truth stays in SQLite; Zustand is for active UI/session state, not long-term record duplication

### Process Patterns

**Error Handling Patterns:**
- Separate user-facing errors from diagnostic errors
- Repository/adapter layers translate low-level errors into domain error codes
- UI shows calm, actionable copy
- Logging keeps raw details; UI does not
- Standard domain error codes:
  - `VALIDATION_ERROR`
  - `NOT_FOUND`
  - `SESSION_STATE_CONFLICT`
  - `PERSISTENCE_ERROR`
  - `PERMISSION_DENIED`
  - `UNEXPECTED_ERROR`

**Loading State Patterns:**
- Loading flags are explicit and local by default
- Preferred names:
  - `isLoading`
  - `isSaving`
  - `isHydrating`
  - `isRecomputingStats`
- Avoid generic `loading` booleans with unclear meaning
- Use screen-level loading for initial hydration
- Use action-level loading for mutations
- Do not block the whole app for local mutations unless startup migration or DB initialization is running

### Enforcement Guidelines

**All AI Agents MUST:**
- Keep SQLite naming in `snake_case` and TypeScript naming in `camelCase`
- Perform DB-to-TS shape mapping only at repository/adapter boundaries
- Keep Tauri/plugin calls out of React components and route files
- Treat `sessions` as the canonical source for statistics and progress
- Use timestamp milliseconds consistently for persisted time fields
- Return discriminated result objects from async boundaries
- Keep persisted truth out of broad global client state
- Add new patterns to this architecture document before introducing exceptions

**Pattern Enforcement:**
- Architecture document is the source of truth for consistency rules
- Story implementations must note any intentional deviation
- Pattern violations are fixed by aligning code to the documented rule, not by creating one-off exceptions
- If a new feature truly needs a new pattern, update architecture before broad implementation

### Pattern Examples

**Good Examples:**
- DB row: `{ started_at_ms, planned_duration_sec, topic_id }`
- TS model: `{ startedAtMs, plannedDurationSec, topicId }`
- Adapter mapping converts between the two once
- Component calls `startSession()` from a domain hook, not SQL/plugin APIs directly
- Error result: `{ ok: false, code: "SESSION_STATE_CONFLICT", message: "진행 중인 세션이 이미 있습니다." }`

**Anti-Patterns:**
- Components executing SQL directly
- One screen storing `startedAt`, another storing `started_at`
- Mixed timestamp formats across features
- Statistics persisted as mutable summary truth without recomputation path
- Global catch-all `appStore` holding every entity in memory
- Raw driver/plugin error text shown directly to users

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
bmad_test/
├── README.md
├── package.json
├── package-lock.json
├── index.html
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
├── .gitignore
├── .env.example
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── build-macos.yml
├── public/
│   ├── icons/
│   └── characters/
│       ├── default.svg
│       ├── loading.svg
│       └── speak.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── app/
│   │   ├── router.tsx
│   │   ├── routes/
│   │   │   ├── HomeRoute.tsx
│   │   │   ├── TopicsRoute.tsx
│   │   │   ├── StatsRoute.tsx
│   │   │   └── NotFoundRoute.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── MainNavigation.tsx
│   │   │   └── FocusLayout.tsx
│   │   └── providers/
│   │       ├── AppProviders.tsx
│   │       └── ErrorBoundaryProvider.tsx
│   ├── assets/
│   │   └── characters/
│   │       ├── default.svg
│   │       ├── loading.svg
│   │       └── speak.svg
│   ├── shared/
│   │   ├── ui/
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Dialog/
│   │   │   ├── Input/
│   │   │   ├── ProgressBar/
│   │   │   ├── StatusBadge/
│   │   │   └── EmptyState/
│   │   ├── lib/
│   │   │   ├── result.ts
│   │   │   ├── errors.ts
│   │   │   ├── time.ts
│   │   │   ├── dates.ts
│   │   │   └── formatters.ts
│   │   ├── hooks/
│   │   │   ├── useAsyncAction.ts
│   │   │   └── useEscapeKey.ts
│   │   ├── constants/
│   │   │   ├── routes.ts
│   │   │   ├── session-phases.ts
│   │   │   └── error-codes.ts
│   │   ├── types/
│   │   │   └── ui.ts
│   │   └── styles/
│   │       ├── tokens.css
│   │       ├── globals.css
│   │       └── utilities.css
│   ├── platform/
│   │   └── tauri/
│   │       ├── sql-client.ts
│   │       ├── store-client.ts
│   │       ├── notification-client.ts
│   │       ├── capabilities.ts
│   │       └── paths.ts
│   ├── db/
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_indexes.sql
│   │   │   └── 003_seed_defaults.sql
│   │   ├── schema/
│   │   │   ├── topics.sql
│   │   │   ├── weekly_goals.sql
│   │   │   └── sessions.sql
│   │   └── bootstrap/
│   │       ├── runMigrations.ts
│   │       └── initializeDatabase.ts
│   ├── domain/
│   │   ├── topics/
│   │   │   ├── topic.ts
│   │   │   ├── topic-schema.ts
│   │   │   ├── topic-repository.ts
│   │   │   └── topic-mappers.ts
│   │   ├── goals/
│   │   │   ├── weekly-goal.ts
│   │   │   ├── weekly-goal-schema.ts
│   │   │   ├── weekly-goal-repository.ts
│   │   │   └── weekly-goal-mappers.ts
│   │   ├── sessions/
│   │   │   ├── session.ts
│   │   │   ├── session-schema.ts
│   │   │   ├── session-repository.ts
│   │   │   ├── session-mappers.ts
│   │   │   ├── session-timer.ts
│   │   │   ├── session-transitions.ts
│   │   │   └── session-statistics.ts
│   │   └── statistics/
│   │       ├── statistics.ts
│   │       ├── statistics-repository.ts
│   │       └── statistics-mappers.ts
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── StudyStatusSummaryCard.tsx
│   │   │   │   ├── WeeklyProgressCard.tsx
│   │   │   │   └── CharacterStatePanel.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDashboardData.ts
│   │   │   └── dashboard-service.ts
│   │   ├── session/
│   │   │   ├── SessionPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── TopicQuickSelectPanel.tsx
│   │   │   │   ├── SessionFocusTimer.tsx
│   │   │   │   └── SessionOutcomePanel.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useActiveSession.ts
│   │   │   │   └── useSessionClock.ts
│   │   │   ├── state/
│   │   │   │   ├── sessionStore.ts
│   │   │   │   └── sessionSelectors.ts
│   │   │   └── session-service.ts
│   │   ├── topics/
│   │   │   ├── TopicsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── TopicList.tsx
│   │   │   │   ├── TopicForm.tsx
│   │   │   │   └── TopicCard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useTopics.ts
│   │   │   └── topic-service.ts
│   │   ├── goals/
│   │   │   ├── components/
│   │   │   │   ├── GoalSettingsDialog.tsx
│   │   │   │   └── GoalProgressInline.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useWeeklyGoals.ts
│   │   │   └── goal-service.ts
│   │   ├── stats/
│   │   │   ├── StatsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── StatsSummaryCard.tsx
│   │   │   │   ├── TopicBreakdownList.tsx
│   │   │   │   └── WeeklyTrendPanel.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useStatistics.ts
│   │   │   └── statistics-service.ts
│   │   └── records/
│   │       ├── components/
│   │       │   ├── RecordList.tsx
│   │       │   ├── RecordCorrectionDialog.tsx
│   │       │   └── RecordCorrectionItem.tsx
│   │       ├── hooks/
│   │       │   └── useRecordCorrection.ts
│   │       └── record-correction-service.ts
│   └── test/
│       ├── fixtures/
│       │   ├── topics.ts
│       │   ├── weekly-goals.ts
│       │   └── sessions.ts
│       ├── helpers/
│       │   ├── renderWithProviders.tsx
│       │   └── fakeClock.ts
│       └── e2e/
│           ├── session-flow.spec.ts
│           ├── record-correction.spec.ts
│           └── stats-recomputation.spec.ts
└── src-tauri/
    ├── Cargo.toml
    ├── build.rs
    ├── tauri.conf.json
    ├── capabilities/
    │   └── default.json
    ├── icons/
    └── src/
        ├── main.rs
        └── lib.rs
```

### Architectural Boundaries

**API Boundaries:**
- No network API boundary exists in MVP
- Frontend-to-native access is limited to:
  - SQLite access
  - lightweight settings access
  - notification access
- All such access must pass through `src/platform/tauri/`
- React pages/components never call Tauri plugins directly

**Component Boundaries:**
- `src/app/` owns routing, shell, and top-level layout only
- `src/features/` owns user-facing screens and feature-specific UI
- `src/shared/ui/` contains reusable primitives, not feature business logic
- `src/domain/` owns domain types, repositories, validation, and core rules
- `src/features/*` may depend on `src/domain/*` and `src/shared/*`
- `src/domain/*` must not depend on feature UI modules

**Service Boundaries:**
- Feature services orchestrate use cases for one feature
- Repository modules own persistence and row/model mapping
- Timer transition logic stays inside `src/domain/sessions/`
- Statistics recomputation logic stays in session/statistics domain modules, never duplicated in UI

**Data Boundaries:**
- SQLite is the single persisted truth for topics, goals, sessions
- `sessions` is the canonical record source for statistics
- Zustand stores hold active UI/session state only
- Store plugin is reserved for lightweight preferences only
- DB row shape conversion happens only in repository/mapper modules

### Requirements to Structure Mapping

**Feature Mapping:**
- 학습 세션 관리
  - `src/features/session/`
  - `src/domain/sessions/`
- 주제 관리
  - `src/features/topics/`
  - `src/domain/topics/`
- 목표 관리
  - `src/features/goals/`
  - `src/domain/goals/`
- 오늘 진행 상황 및 통계
  - `src/features/dashboard/`
  - `src/features/stats/`
  - `src/domain/statistics/`
- 기록 정정 및 데이터 신뢰성
  - `src/features/records/`
  - `src/domain/sessions/`
- 내비게이션 및 앱 구조
  - `src/app/router.tsx`
  - `src/app/layout/`
- 로컬 데이터 보존
  - `src/db/`
  - `src/platform/tauri/sql-client.ts`
  - `src/domain/*-repository.ts`
- 데스크톱 앱 동작 보조 기능
  - `src/platform/tauri/notification-client.ts`
  - `src-tauri/capabilities/`

**Cross-Cutting Concerns:**
- 캐릭터 상태 자산
  - `public/characters/` and `src/assets/characters/`
- 에러 코드/결과 객체
  - `src/shared/lib/errors.ts`
  - `src/shared/lib/result.ts`
- 시간 계산/포맷팅
  - `src/shared/lib/time.ts`
  - `src/shared/lib/dates.ts`
- 공통 UI primitive
  - `src/shared/ui/`
- 앱 초기화/마이그레이션
  - `src/db/bootstrap/`
  - `src/app/providers/`

### Integration Points

**Internal Communication:**
- Route -> feature page -> feature hook/service -> domain repository -> Tauri adapter -> SQLite
- Session completion -> session domain logic -> statistics query refresh -> dashboard/stats feature refresh
- Record correction -> record correction service -> session repository update -> stats recomputation -> UI refresh

**External Integrations:**
- Tauri SQL plugin
- Tauri Store plugin
- Tauri Notification plugin
- No third-party network services in MVP

**Data Flow:**
- App startup initializes DB and runs migrations
- Home/dashboard reads derived statistics from domain/statistics layer
- Session flow writes canonical session records first
- Goal progress and statistics are recomputed from persisted records
- Notification side effects occur after successful session state transitions, not before

### File Organization Patterns

**Configuration Files:**
- Root JS/TS toolchain config stays at repository root
- Native app config stays under `src-tauri/`
- DB migration files stay under `src/db/migrations/`
- CI configs stay under `.github/workflows/`

**Source Organization:**
- `app` for shell/routing
- `features` for screens and feature orchestration
- `domain` for business rules and persistence
- `shared` for primitives/utilities
- `platform` for Tauri/native bridges
- `db` for schema bootstrap and migrations

**Test Organization:**
- Unit/component tests co-located where practical
- Shared test fixtures/helpers live in `src/test/`
- End-to-end flows live in `src/test/e2e/`

**Asset Organization:**
- Public static assets in `public/`
- Imported UI assets in `src/assets/`
- Character SVG names remain unchanged for UX consistency

### Development Workflow Integration

**Development Server Structure:**
- Vite serves the React app from root/source tree
- Tauri dev wraps the frontend dev server and native shell
- Feature modules can be developed independently under `src/features/`

**Build Process Structure:**
- Frontend build consumes `src/`
- Native packaging consumes `src-tauri/`
- DB migrations are bundled as app resources and executed at startup

**Deployment Structure:**
- macOS desktop bundles are produced through Tauri packaging
- No server deployment structure is required in MVP
- CI validates both frontend correctness and native packaging boundaries

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
선정한 기술 조합은 서로 잘 맞는다. Tauri 2는 React/Vite 기반 데스크톱 앱 구조와 자연스럽게 결합되며, SQLite 기반 로컬 영속성, Store/Notification 플러그인, capability 보안 모델도 앞선 결정과 충돌하지 않는다. React Router 기반 화면 경계, Zustand의 소규모 UI 상태 관리, Zod의 경계 검증, SQLite의 단일 사실원천 모델 역시 상호 보완적이다. 타이머를 timestamp 기반으로 정의한 결정도 앱 재실행/백그라운드/통계 재계산 요구와 일관된다.

**Pattern Consistency:**
구현 패턴은 아키텍처 결정을 잘 뒷받침한다. DB는 `snake_case`, TypeScript는 `camelCase`, 네이티브 접근은 adapter 경계, persisted truth는 SQLite, UI 상태는 Zustand로 한정하는 규칙이 기술 선택과 직접 정렬되어 있다. 결과 객체, 에러 코드, timestamp format, feature/domain 분리 규칙도 충돌 없이 맞물린다.

**Structure Alignment:**
정의한 프로젝트 구조는 선택한 기술 스택과 패턴을 실제 파일/디렉터리 수준으로 구현 가능하게 만든다. `app / features / domain / platform / db / shared / src-tauri` 경계가 명확하고, Tauri adapter 경계와 repository 경계, statistics recomputation 경계도 구조 안에 반영되어 있다. 따라서 구조가 아키텍처를 충분히 지지한다.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
에픽 문서는 아직 없지만, 기능 요구사항 카테고리 기준으로 모든 주요 기능이 구조와 결정에 매핑되어 있다. 세션 관리, 주제 관리, 목표 관리, 통계 확인, 기록 정정, 내비게이션, 로컬 보존, 알림 보조 기능 모두 대응 모듈이 지정되어 있다.

**Functional Requirements Coverage:**
모든 FR 카테고리가 아키텍처적으로 지원된다.
- 학습 세션 관리: `domain/sessions`, `features/session`
- 주제 관리: `domain/topics`, `features/topics`
- 목표 관리: `domain/goals`, `features/goals`
- 오늘 진행 상황 및 통계: `features/dashboard`, `features/stats`, `domain/statistics`
- 기록 정정 및 데이터 신뢰성: `features/records`, `domain/sessions`
- 내비게이션: `app/router`, `app/layout`
- 로컬 데이터 보존: `db`, repository, Tauri SQL adapter
- 데스크톱 보조 기능: notification adapter와 `src-tauri/capabilities`

**Non-Functional Requirements Coverage:**
- Performance: SQL 기반 집계, active timer rerender isolation, local-first 구조로 대응
- Security: no auth MVP, local-only data, Tauri capabilities, no remote scripts 정책으로 대응
- Reliability: timestamp timer model, migrations, canonical session event log로 대응
- Offline support: remote API 없음, SQLite 기반 로컬 동작으로 대응
- Accessibility: shared UI primitives, route/layout separation, explicit state/feedback patterns로 대응
- Maintainability: feature/domain 분리, naming rules, adapter boundaries, co-located tests로 대응

### Implementation Readiness Validation ✅

**Decision Completeness:**
대부분의 핵심 결정이 문서화되어 있고, blocker 수준의 누락은 없다. 스타터, 영속성, 상태 관리, 라우팅, 검증, 보안 경계, 통계 재계산 원칙, 프로젝트 구조가 모두 정리되어 있다.

**Structure Completeness:**
프로젝트 트리는 충분히 구체적이다. app shell, feature pages, domain repositories, migrations, Tauri native root, assets, tests, CI 위치까지 정의되어 있어 구현 착수가 가능하다.

**Pattern Completeness:**
충돌 가능성이 높은 naming, DB/TS shape mapping, plugin access, error handling, result object shape, loading states, event naming, state boundaries가 모두 규칙화되어 있다. AI 에이전트 간 일관성 확보에 충분한 수준이다.

### Gap Analysis Results

**Critical Gaps:**
- 없음

**Important Gaps:**
- 테스트 러너 선택이 아직 고정되지 않았다.
- browser QA harness / mock runtime 전략이 아직 구현되지 않았다.
- lint/format 조합에서 formatter 선택이 아직 명시되지 않았다.
- Tauri capability 파일의 실제 scope 항목은 첫 구현 story에서 구체화해야 한다.

**Nice-to-Have Gaps:**
- codesign/notarization 상세 전략
- auto-updater 도입 조건
- 향후 export 기능의 파일 구조/권한 처리 가이드
- 장기적으로 telemetry/crash reporting 정책

### Validation Issues Addressed

검증 과정에서 blocker 수준 문제는 발견되지 않았다. 남아 있는 항목은 대부분 구현 첫 story에서 확정해도 되는 운영 상세 수준이다. 현재 문서는 아키텍처 의사결정과 구현 경계를 안내하는 목적에 충분하다.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** high

**Key Strengths:**
- 로컬 우선 학습 앱 요구와 기술 선택이 잘 정렬되어 있다.
- `sessions` 단일 사실원천 원칙이 데이터 신뢰성을 강하게 보장한다.
- Tauri adapter/repository 경계가 명확해 UI와 영속성 충돌을 줄인다.
- AI 에이전트 구현 충돌을 막는 패턴이 충분히 구체적이다.
- 프로젝트 구조가 기능 요구사항과 직접 연결된다.

**Areas for Future Enhancement:**
- 테스트 툴링 세부 선택
- capability scope 상세화
- 배포/서명 자동화
- post-MVP 동기화/백업 정책

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
Initialize the Tauri 2 + React + TypeScript project, add SQL/Store/Notification plugins as needed, then implement DB bootstrap and initial migrations before building feature UI.
