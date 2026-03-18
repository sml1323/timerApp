# Story 1.4: SQLite 데이터베이스 초기화 및 마이그레이션 시스템

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 학습자,
I want 앱 재실행 후에도 데이터가 보존되기를,
so that 학습 기록과 목표를 신뢰하고 꾸준히 사용할 수 있다.

## Acceptance Criteria

1. **Given** 앱이 처음 실행될 때 **When** 데이터베이스 초기화가 진행되면 **Then** Tauri SQL 플러그인을 통해 SQLite DB가 앱 데이터 디렉터리에 생성된다
2. **And** forward-only SQL 마이그레이션 시스템이 앱 시작 시 자동 실행된다
3. **And** 초기 스키마 마이그레이션(`topics`, `weekly_goals`, `sessions` 테이블)이 실행된다
4. **And** 앱 재실행 시 이미 실행된 마이그레이션은 건너뛴다
5. **And** `src/platform/tauri/sql-client.ts` adapter가 구현되어 React 컴포넌트에서 직접 Tauri 플러그인을 호출하지 않는다
6. **And** DB 연결 실패 시 사용자에게 명확한 에러 메시지가 표시된다

## Tasks / Subtasks

- [x] Task 1: Tauri SQL 플러그인 설치 및 Rust 쪽 구성 (AC: #1, #2, #4)
  - [x] 1.1 Rust 백엔드에 `tauri-plugin-sql` 크레이트 추가 (`--features sqlite`)
  - [x] 1.2 프론트엔드에 `@tauri-apps/plugin-sql` npm 패키지 추가
  - [x] 1.3 `src-tauri/src/lib.rs`에 SQL 플러그인 초기화 + 마이그레이션 등록
  - [x] 1.4 `src-tauri/capabilities/default.json`에 SQL 퍼미션 추가
- [x] Task 2: 초기 스키마 마이그레이션 SQL 작성 (AC: #3)
  - [x] 2.1 `src/db/migrations/001_initial_schema.sql` — `topics`, `weekly_goals`, `sessions` 테이블 CREATE
  - [x] 2.2 `src/db/migrations/002_indexes.sql` — 성능 인덱스 CREATE
  - [x] 2.3 `src/db/schema/topics.sql` — 참조용 topics DDL
  - [x] 2.4 `src/db/schema/weekly_goals.sql` — 참조용 weekly_goals DDL
  - [x] 2.5 `src/db/schema/sessions.sql` — 참조용 sessions DDL
- [x] Task 3: Tauri SQL adapter 구현 (AC: #5)
  - [x] 3.1 `src/platform/tauri/sql-client.ts` — DB 로드, execute, select 래퍼
  - [x] 3.2 `src/shared/lib/result.ts` — discriminated result 헬퍼 타입
  - [x] 3.3 `src/shared/lib/errors.ts` — 도메인 에러 코드 상수
- [x] Task 4: DB 초기화 부트스트랩 (AC: #1, #6)
  - [x] 4.1 `src/db/bootstrap/initializeDatabase.ts` — DB 연결 + 초기화 함수
  - [x] 4.2 `src/main.tsx` 또는 앱 엔트리에서 DB 초기화 호출 통합
  - [x] 4.3 DB 연결 실패 시 에러 UI 또는 fallback 메시지 표시
- [x] Task 5: 빌드 및 검증
  - [x] 5.1 `npx tsc --noEmit` — TypeScript 오류 없음
  - [x] 5.2 `npm run build` — Vite 빌드 성공
  - [x] 5.3 `npm run tauri dev`에서 앱 실행 → DB 파일 생성 확인
  - [x] 5.4 앱 재실행 후 이미 실행된 마이그레이션 건너뜀 확인 (콘솔 로그 또는 동작)
  - [x] 5.5 DB 파일에 `topics`, `weekly_goals`, `sessions` 테이블 존재 확인

## Dev Notes

### 핵심 기술 요구사항

| 항목 | 상세 |
|------|------|
| DB 엔진 | SQLite (Tauri SQL 플러그인 경유) |
| Rust 크레이트 | `tauri-plugin-sql` with `sqlite` feature |
| JS 패키지 | `@tauri-apps/plugin-sql` |
| 마이그레이션 | Rust 쪽 `Migration` 구조체로 정의, 앱 시작 시 자동 실행 |
| DB 파일 경로 | `sqlite:bmad_test.db` (AppConfig 기준 상대 경로) |
| 네이밍 | DB: `snake_case`, TS: `camelCase`, 매핑은 repository 경계에서만 |
| 결과 객체 | `{ ok: true, data }` / `{ ok: false, code, message }` |
| SQL 파라미터 | SQLite는 `$1, $2, $3` 문법 사용 (sqlx 기반) |

### Tauri SQL 플러그인 설치 가이드

**Step 1: Rust 의존성 추가** (`src-tauri/` 디렉터리에서)
```bash
cargo add tauri-plugin-sql --features sqlite
```

결과 — `Cargo.toml`에 다음이 추가됨:
```toml
[dependencies]
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
```

**Step 2: npm 패키지 추가** (프로젝트 루트에서)
```bash
npm install @tauri-apps/plugin-sql
```

**Step 3: `lib.rs` 수정** — SQL 플러그인 초기화 + 마이그레이션 등록

```rust
// src-tauri/src/lib.rs
use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("../../src/db/migrations/001_initial_schema.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_indexes",
            sql: include_str!("../../src/db/migrations/002_indexes.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:bmad_test.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

> **중요:** `include_str!` 경로는 `src-tauri/src/lib.rs` 기준 상대 경로다. `../../src/db/migrations/` 경로가 올바른지 확인 필요.

> **중요:** 기존 `greet` 커맨드와 `invoke_handler`는 현재 사용되지 않는다. 제거하거나 유지는 자유이나, 깔끔하게 제거 권장.

**Step 4: `tauri.conf.json`에 DB preload 추가**

```json
{
  "plugins": {
    "sql": {
      "preload": ["sqlite:bmad_test.db"]
    }
  }
}
```

**Step 5: `capabilities/default.json`에 SQL 퍼미션 추가**

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default",
    "sql:default",
    "sql:allow-execute",
    "sql:allow-select"
  ]
}
```

> **중요:** `sql:default`만으로는 `execute`/`select` 호출이 차단된다. 반드시 `sql:allow-execute`, `sql:allow-select`를 명시해야 한다.

### 초기 스키마 SQL

**`001_initial_schema.sql`** — 3개 테이블 생성:

```sql
-- topics table
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL
);

-- weekly_goals table
CREATE TABLE IF NOT EXISTS weekly_goals (
    id TEXT PRIMARY KEY NOT NULL,
    topic_id TEXT NOT NULL,
    week_start_at_ms INTEGER NOT NULL,
    target_minutes INTEGER NOT NULL,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE RESTRICT
);

-- sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    topic_id TEXT NOT NULL,
    phase_type TEXT NOT NULL CHECK (phase_type IN ('study', 'break')),
    status TEXT NOT NULL CHECK (status IN ('planned', 'running', 'completed', 'interrupted')),
    started_at_ms INTEGER NOT NULL,
    planned_duration_sec INTEGER NOT NULL,
    ended_at_ms INTEGER,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE RESTRICT
);
```

**설계 결정 근거:**
- `id`는 `TEXT` (UUID) — 클라이언트 생성, 충돌 방지
- 타임스탬프 컬럼은 `_at_ms` 접미사 (Unix epoch milliseconds)
- `is_archived`는 `INTEGER` (SQLite에 boolean 타입 없음, 0/1)
- `phase_type`과 `status`는 CHECK 제약으로 유효값 제한
- `ON DELETE RESTRICT` — 세션이나 목표가 있는 주제 삭제 방지
- `ended_at_ms`는 NULLABLE — 진행 중 세션은 아직 종료 안됨

**`002_indexes.sql`** — 성능 인덱스:

```sql
CREATE INDEX IF NOT EXISTS idx_sessions_topic_id_started_at_ms
    ON sessions(topic_id, started_at_ms);

CREATE INDEX IF NOT EXISTS idx_sessions_status
    ON sessions(status);

CREATE INDEX IF NOT EXISTS idx_weekly_goals_topic_id_week_start_at_ms
    ON weekly_goals(topic_id, week_start_at_ms);

CREATE INDEX IF NOT EXISTS idx_topics_is_archived
    ON topics(is_archived);
```

> **네이밍 규칙:** `idx_<table>_<column>[_<column>]` — architecture.md 패턴 준수

### sql-client.ts Adapter 설계

```typescript
// src/platform/tauri/sql-client.ts
import Database from '@tauri-apps/plugin-sql';

const DB_NAME = 'sqlite:bmad_test.db';

let dbInstance: Database | null = null;

/** DB 싱글턴 인스턴스 반환. 최초 호출 시 load + 마이그레이션 자동 실행 */
export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load(DB_NAME);
  }
  return dbInstance;
}

/** SELECT 쿼리 실행 — 결과 행 배열 반환 */
export async function select<T>(query: string, bindValues?: unknown[]): Promise<T[]> {
  const db = await getDb();
  return db.select<T[]>(query, bindValues);
}

/** INSERT/UPDATE/DELETE 실행 — 영향 받은 행 수 반환 */
export async function execute(query: string, bindValues?: unknown[]): Promise<{ rowsAffected: number; lastInsertId: number }> {
  const db = await getDb();
  return db.execute(query, bindValues);
}
```

> **핵심 원칙:** React 컴포넌트/훅에서 `Database`를 직접 import 금지. 반드시 `sql-client.ts`의 `select`/`execute`를 통해 접근.

### result.ts 설계

```typescript
// src/shared/lib/result.ts
export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; details?: E };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<T>(code: string, message: string, details?: unknown): Result<T> {
  return { ok: false, code, message, details };
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}
```

### errors.ts 설계

```typescript
// src/shared/lib/errors.ts
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SESSION_STATE_CONFLICT: 'SESSION_STATE_CONFLICT',
  PERSISTENCE_ERROR: 'PERSISTENCE_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
```

### DB 초기화 부트스트랩

```typescript
// src/db/bootstrap/initializeDatabase.ts
import { getDb } from '../../platform/tauri/sql-client';

/**
 * 앱 시작 시 DB 연결 확인.
 * 마이그레이션은 Rust 쪽 tauri-plugin-sql이 DB.load() 시 자동 실행.
 * 이 함수는 연결 검증 + 초기 상태 확인용.
 */
export async function initializeDatabase(): Promise<void> {
  const db = await getDb();
  // 간단한 연결 검증
  await db.select<{ count: number }[]>('SELECT 1 as count');
}
```

> **중요:** 마이그레이션은 Rust 쪽 `tauri_plugin_sql::Builder::add_migrations`에서 등록하고, 프론트엔드에서 `Database.load()` 시 자동 실행된다. TypeScript 쪽 `runMigrations.ts`는 이 스토리에서 구현하지 않는다 (Rust 레벨에서 처리됨).

### DB 연결 실패 시 에러 처리

`src/main.tsx` 또는 앱 진입점에서 `initializeDatabase`를 호출하되, 실패 시 사용자에게 에러 UI를 보여줘야 한다:

```typescript
// 예시 — main.tsx 또는 AppProviders에서
try {
  await initializeDatabase();
} catch (error) {
  // 에러 상태를 표시하는 fallback UI
  console.error('DB 초기화 실패:', error);
  // 사용자에게 "데이터베이스 초기화에 실패했습니다" 메시지 표시
}
```

간단한 에러 UI로 충분하다. 완전한 ErrorBoundaryProvider는 이후 스토리에서 구현할 수 있다.

### schema/ 디렉터리 참조 파일

`src/db/schema/` 디렉터리의 SQL 파일은 **참조 문서** 역할이다. 실제 마이그레이션은 `migrations/` 디렉터리에서만 실행된다. 각 schema 파일은 해당 테이블의 현재 상태를 문서화하여 개발자가 빠르게 구조를 파악하게 돕는다.

### Project Structure Notes

이 스토리에서 생성/수정하는 파일:

```
src-tauri/
├── Cargo.toml                              (수정 — tauri-plugin-sql 추가)
├── src/lib.rs                              (수정 — SQL 플러그인 + 마이그레이션 등록)
├── capabilities/default.json               (수정 — SQL 퍼미션 추가)
├── tauri.conf.json                         (수정 — plugins.sql.preload 추가)

src/
├── db/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql          (신규)
│   │   └── 002_indexes.sql                 (신규)
│   ├── schema/
│   │   ├── topics.sql                      (신규 — 참조 문서)
│   │   ├── weekly_goals.sql                (신규 — 참조 문서)
│   │   └── sessions.sql                    (신규 — 참조 문서)
│   └── bootstrap/
│       └── initializeDatabase.ts           (신규)
├── platform/
│   └── tauri/
│       └── sql-client.ts                   (신규)
├── shared/
│   └── lib/
│       ├── result.ts                       (신규)
│       └── errors.ts                       (신규)

package.json                                (수정 — @tauri-apps/plugin-sql 추가)
```

### Anti-Patterns to Avoid

- ❌ React 컴포넌트에서 `Database`(`@tauri-apps/plugin-sql`)를 직접 import
- ❌ SQL 마이그레이션을 TypeScript 쪽에서 실행 (Rust `add_migrations`가 처리)
- ❌ DB 컬럼에 `camelCase` 네이밍 사용 — 반드시 `snake_case`
- ❌ 마이그레이션에 DOWN/rollback SQL 포함 — forward-only 정책
- ❌ `003_seed_defaults.sql` 작성 — 이 스토리에서는 시드 데이터 없음
- ❌ `runMigrations.ts` 구현 — Rust 레벨에서 자동 처리됨
- ❌ `store-client.ts`/`notification-client.ts` 구현 — 이후 스토리 범위
- ❌ 도메인 타입 (`topic.ts`, `session.ts` 등) 구현 — Epic 2/3 범위
- ❌ DB 연결 정보를 환경변수로 관리 — 하드코딩 `sqlite:bmad_test.db`로 충분
- ❌ `autoincrement` INTEGER PK — TEXT UUID 사용
- ❌ Statistics 테이블 생성 — 통계는 sessions에서 파생 계산 (단일 사실원천)
- ❌ `cancelled` 세션 상태 추가 — 현재 epics 정의에 없음

### Previous Story Intelligence (Story 1.1, 1.2, 1.3)

**Story 1.1에서 확립된 패턴:**
- 프로젝트 디렉터리 구조 생성 (`db/`, `platform/`, `domain/`, `shared/lib/` 등 `.gitkeep`)
- `createBrowserRouter` + `RouterProvider` 패턴
- `package.json`에 `@tauri-apps/api: ^2`, `@tauri-apps/plugin-opener: ^2` 설치됨

**Story 1.2에서 확립된 패턴:**
- CSS Modules + CSS variables 패턴 검증
- `cn.ts` (`src/shared/lib/cn.ts`) 구현됨
- `vite-env.d.ts` CSS Modules 타입 선언 존재

**Story 1.3에서 확립된 패턴:**
- AppShell + MainNavigation 레이아웃 구현
- Router에서 AppShell을 루트 레이아웃으로 적용
- `App.tsx` 제거됨 (더 이상 존재하지 않음)
- 3단계 반응형 (Wide ≥1200, Standard 800-1199, Compact <800)

**Debug 교훈:**
- `src/shared/lib/` 디렉터리 존재 확인됨 (현재 `cn.ts`만 있음)
- `src/platform/tauri/` 디렉터리에 `.gitkeep`만 존재
- `src/db/bootstrap/`, `src/db/migrations/`, `src/db/schema/` 모두 `.gitkeep`만 존재

### Git Intelligence

최근 커밋:
1. `768bec1` — `feat: Implement a new AppShell and MainNavigation...`
2. `a70edbc` — `feat: Introduce Button component with comprehensive styling...`
3. `8658996` — `feat: Initialize new Tauri application with React/Vite frontend...`

현재 기술 스택:
- React 19.1.0 + TypeScript 5.8.3 + Vite 7.x + React Router 7.13.1
- Zustand 5.0.12, Zod 4.3.6
- Tauri 2.x (`@tauri-apps/api: ^2`, `@tauri-apps/cli: ^2`)
- 현재 `lib.rs`에 `tauri_plugin_opener`만 등록됨
- 현재 `capabilities/default.json`에 `core:default`, `opener:default`만 설정됨

### Tauri SQL 플러그인 기술 참고

- 공식 문서: https://v2.tauri.app/plugin/sql/
- SQL 엔진: sqlx 기반, SQLite 파라미터는 `$1, $2, $3` 사용
- DB 경로: `sqlite:<filename>` — AppConfig 디렉터리 기준 상대 경로
- 마이그레이션: `Migration { version, description, sql, kind: MigrationKind::Up }` 구조체
- `include_str!` 매크로로 외부 .sql 파일 포함 가능
- 마이그레이션은 트랜잭션으로 실행 — 실패 시 롤백
- 이미 실행된 마이그레이션은 자동으로 건너뜀 (버전 번호 기반)
- `Database.load()` 호출 시 마이그레이션 자동 적용

### 이 스토리에서 하지 않는 것

- 도메인 타입/스키마 정의 (topic.ts, session.ts 등) → Epic 2, 3
- Repository 함수 구현 → Epic 2, 3
- Zustand store 구현 → Epic 2, 3
- Store plugin / Notification plugin → 이후 스토리
- 시드 데이터 삽입 → 불필요
- 테스트 코드 (fixture, helper) → 이후 스토리
- ErrorBoundaryProvider 완전 구현 → 이후 스토리
- FocusLayout → Story 3.2

### References

- [Source: architecture.md#Data Architecture] — SQLite 단일 사실원천, 마이그레이션 전략, 타이머 모델링
- [Source: architecture.md#Naming Patterns] — DB snake_case, TS camelCase, idx 네이밍
- [Source: architecture.md#Structure Patterns] — `src/db/`, `src/platform/tauri/`, `src/domain/` 경계
- [Source: architecture.md#API & Communication Patterns] — discriminated result, 에러 코드 카테고리
- [Source: architecture.md#Implementation Patterns] — adapter 경계, DB row ↔ TS 매핑 규칙
- [Source: architecture.md#Project Structure] — 전체 디렉터리 트리
- [Source: epics.md#Story 1.4] — 수락 기준 원본
- [Source: epics.md#Epic 1] — 추가 요구사항 (SQLite + 마이그레이션 구성)
- [Source: Tauri SQL Plugin Docs] — https://v2.tauri.app/plugin/sql/

## Dev Agent Record

### Agent Model Used

Antigravity (Google Deepmind)

### Debug Log References

- `lastInsertId` 타입 이슈 (`number | undefined`): `sql-client.ts` execute() 반환 타입을 optional로 수정하여 해결

### Completion Notes List

- ✅ Task 1: `tauri-plugin-sql` v2.3.2 + `@tauri-apps/plugin-sql` npm 설치, `lib.rs` SQL 플러그인 + `include_str!` 마이그레이션 등록, `capabilities/default.json` SQL 퍼미션 추가, `tauri.conf.json` preload 설정
- ✅ Task 2: `001_initial_schema.sql` (topics, weekly_goals, sessions 테이블 + CHECK 제약 + FK), `002_indexes.sql` (4개 성능 인덱스), schema 참조 문서 3개
- ✅ Task 3: `sql-client.ts` 싱글턴 DB + select/execute 래퍼, `result.ts` discriminated Result 타입, `errors.ts` 도메인 에러 코드
- ✅ Task 4: `initializeDatabase.ts` 연결 검증 함수, `main.tsx` 비동기 초기화 통합 (loading/error/ready 상태), 에러 발생 시 한국어 에러 UI + 기술 상세 표시
- ✅ Task 5: `tsc --noEmit` 0 errors, `npm run build` 성공, `cargo check` Rust 컴파일 성공

### Change Log

- 2026-03-18: Story 1.4 구현 완료 — SQLite 데이터베이스 초기화 + 마이그레이션 시스템

### File List

- src-tauri/Cargo.toml (수정 — tauri-plugin-sql 의존성 추가)
- src-tauri/src/lib.rs (수정 — SQL 플러그인 + 마이그레이션 등록, greet 커맨드 제거)
- src-tauri/capabilities/default.json (수정 — sql:default, sql:allow-execute, sql:allow-select 추가)
- src-tauri/tauri.conf.json (수정 — plugins.sql.preload 추가)
- src/db/migrations/001_initial_schema.sql (신규)
- src/db/migrations/002_indexes.sql (신규)
- src/db/schema/topics.sql (신규)
- src/db/schema/weekly_goals.sql (신규)
- src/db/schema/sessions.sql (신규)
- src/db/bootstrap/initializeDatabase.ts (신규)
- src/platform/tauri/sql-client.ts (신규)
- src/shared/lib/result.ts (신규)
- src/shared/lib/errors.ts (신규)
- src/main.tsx (수정 — DB 초기화 통합 + 에러 UI)
- package.json (수정 — @tauri-apps/plugin-sql 추가)
