---
title: '앱 시작 시 방치된 세션 자동 복구'
slug: 'abandoned-session-recovery'
created: '2026-03-20T15:37:00+09:00'
status: 'implemented'
stepsCompleted: [1, 2, 3, 4]
tech_stack: [TypeScript, React, Zustand, Tauri, SQLite, Zod]
files_to_modify:
  - src/domain/sessions/session-repository.ts
  - src/platform/browser/in-memory-session-adapter.ts
  - src/platform/browser/session-adapter.ts
  - src/features/session/session-service.ts
  - src/main.tsx
code_patterns:
  - Result<T> 패턴 (ok/err) — shared/lib/result.ts
  - 런타임 분기 (isTauriRuntime) — platform/runtime/runtime-detect.ts
  - SessionRepositoryAdapter 인터페이스 — session-adapter.ts
  - SQL 헬퍼 (select/execute) — platform/tauri/sql-client.ts
  - 상태 전이 맵 — domain/sessions/session-transitions.ts
test_patterns:
  - 프로젝트 수준 테스트 프레임워크 미설정
  - 브라우저 QA 모드로 수동 검증
---

# Tech-Spec: 앱 시작 시 방치된 세션 자동 복구

**Created:** 2026-03-20T15:37:00+09:00

## Overview

### Problem Statement

앱이 비정상 종료되거나 페이지를 새로고침한 경우, DB(Tauri) 또는 in-memory store(브라우저)에 `status = 'running'` 상태의 세션이 남아있다. Zustand sessionStore는 메모리에만 존재하므로 재시작 시 `idle`로 초기화되지만, persistence layer에는 running 세션이 그대로 남아있어 새 세션 생성 시 `SESSION_STATE_CONFLICT`(`'이미 진행 중인 세션이 있습니다'`) 에러가 발생한다.

**발생 지점:**
- `session-repository.ts` L43~44: SQLite `SELECT id FROM sessions WHERE status = 'running'` 후 에러 반환
- `in-memory-session-adapter.ts` L40~42: `store.find(s => s.status === 'running')` 후 에러 반환

### Solution

앱 초기화(`initializeAppRuntime`) 단계에서 **방치된 running 세션을 자동으로 `interrupted` 상태로 전환**하는 복구 로직을 추가한다.

### Scope

**In Scope:**
- `recoverAbandonedSessions()` 함수를 session-adapter 레이어에 추가
- Tauri(SQLite) 및 브라우저(in-memory) 양쪽 구현
- `main.tsx`의 `initializeAppRuntime()`에서 부트스트랩 시 호출

**Out of Scope:**
- 사용자 대면 복구 알림 UI
- 경과 시간 기반 endedAtMs 복원
- 기존 상태 전이 로직 변경

## Context for Development

### Codebase Patterns

| 패턴 | 상세 |
| ---- | ---- |
| `Result<T>` | `ok(data)` / `err(code, message)` — `shared/lib/result.ts` |
| 런타임 분기 | `isTauriRuntime()` — `platform/runtime/runtime-detect.ts` |
| Adapter 인터페이스 | `SessionRepositoryAdapter` — `session-adapter.ts` L15~23 |
| SQL 헬퍼 | `select<T>(query, bindValues)`, `execute(query, bindValues)` — `sql-client.ts` |
| 상태 전이 | `running → interrupted` 유효 — `session-transitions.ts` L8 |

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/domain/sessions/session.ts` | Session 타입, SessionStatus 정의 |
| `src/domain/sessions/session-transitions.ts` | `running→interrupted` 전이 유효 확인 |
| `src/domain/sessions/session-repository.ts` | Tauri SQLite 구현 — 여기에 `recoverAbandonedSessions` 추가 |
| `src/platform/browser/in-memory-session-adapter.ts` | 브라우저 구현 — 여기에 `recoverAbandonedSessions` 추가 |
| `src/platform/browser/session-adapter.ts` | 런타임 분기 어댑터 인터페이스 — 함수 추가 |
| `src/features/session/session-service.ts` | 비즈니스 로직 — 복구 오케스트레이션 추가 |
| `src/main.tsx` | 앱 초기화 — 복구 함수 호출 지점 |

### Technical Decisions

- **`interrupted` 상태 사용**: `completed`가 아닌 `interrupted`로 전환 (비정상 종료이므로)
- **`endedAtMs = Date.now()`**: 정확한 종료 시각 불명이므로 현재 시각 사용
- **반환 타입 `Result<number>`**: 복구된 세션 수를 반환하여 로깅 가능
- **fire-and-forget 로깅**: 복구 결과는 `console.info`로 기록, UI 표시 없음
- **bootstrap 단계에서 호출**: session-service를 거치지 않고 adapter를 직접 호출하여 순환 의존 방지

## Implementation Plan

### Tasks

- [x] Task 1: `session-repository.ts`에 `recoverAbandonedSessions` 추가
  - File: `src/domain/sessions/session-repository.ts`
  - Action: `export async function recoverAbandonedSessions(): Promise<Result<number>>` 함수 추가
  - Notes: `execute()` 사용하여 `UPDATE sessions SET status = 'interrupted', ended_at_ms = $1, updated_at_ms = $2 WHERE status = 'running'` 실행. `rowsAffected`를 `ok()`로 반환. try/catch로 `PERSISTENCE_ERROR` 처리.

- [x] Task 2: `in-memory-session-adapter.ts`에 `recoverAbandonedSessions` 추가
  - File: `src/platform/browser/in-memory-session-adapter.ts`
  - Action: `export async function recoverAbandonedSessions(): Promise<Result<number>>` 함수 추가
  - Notes: `store` 배열을 순회하며 `status === 'running'`인 세션을 찾아 `status = 'interrupted'`, `endedAtMs = Date.now()`, `updatedAtMs = Date.now()`로 갱신. 갱신된 건수를 `ok()`로 반환.

- [x] Task 3: `session-adapter.ts`에 인터페이스 및 분기 함수 추가
  - File: `src/platform/browser/session-adapter.ts`
  - Action: `SessionRepositoryAdapter` 인터페이스에 `recoverAbandonedSessions(): Promise<Result<number>>` 추가. `export async function recoverAbandonedSessions(): Promise<Result<number>>` 분기 함수 추가.
  - Notes: 기존 `createSession`, `completeSession` 등과 동일한 패턴으로 `(await getAdapter()).recoverAbandonedSessions()` 호출.

- [x] Task 4: `main.tsx`의 `initializeAppRuntime()`에서 복구 함수 호출
  - File: `src/main.tsx`
  - Action: `initializeAppRuntime()` 함수 내 각 런타임 초기화 완료 직후에 `recoverAbandonedSessions()`를 호출하고 결과를 로깅.
  - Notes: `session-adapter.ts`에서 `recoverAbandonedSessions`를 import. Tauri 분기의 `initializeDatabase()` 호출 직후, `return` 전에 호출. 브라우저 분기의 `initializeBrowserQaRuntime()` 호출 직후에도 동일하게 호출. 결과가 `ok`이고 `data > 0`이면 `console.info`로 복구 건수 로깅. 에러 시 `console.warn`만 출력 (부트스트랩을 중단하지 않음).

### Acceptance Criteria

- [x] AC 1: Given DB에 `status = 'running'` 세션이 1개 이상 존재할 때, When 앱이 시작되면, Then 해당 세션들이 `status = 'interrupted'`로 전환되고 `endedAtMs`에 현재 시각이 기록된다.

- [x] AC 2: Given DB에 `running` 세션이 없을 때, When 앱이 시작되면, Then 복구 함수가 `ok(0)`을 반환하고 기존 세션 데이터에 영향이 없다.

- [x] AC 3: Given 이전 세션이 비정상 종료되어 `running` 상태로 남아있을 때, When 사용자가 주제를 선택하고 "학습 시작"을 누르면, Then `SESSION_STATE_CONFLICT` 에러 없이 새 세션이 정상 시작된다.

- [x] AC 4: Given 복구 과정에서 DB 오류가 발생할 때, When 앱이 시작되면, Then 복구 실패가 `console.warn`으로 기록되고 앱 부트스트랩은 중단되지 않는다.

- [x] AC 5: Given `completed` 또는 `interrupted` 상태의 기존 세션이 있을 때, When 앱이 시작되면, Then 해당 세션들의 상태가 변경되지 않는다 (running 세션만 복구 대상).

## Additional Context

### Dependencies

- `session-transitions.ts`의 `running → interrupted` 전이가 이미 유효함 확인 완료
- `sql-client.ts`의 `execute()` 함수가 `{ rowsAffected }` 반환
- 외부 라이브러리 추가 불필요

### Testing Strategy

- **수동 검증 (브라우저 QA 모드)**:
  1. `npm run dev`로 앱 실행
  2. 주제 선택 → "학습 시작" 클릭 (세션 시작됨)
  3. 페이지 새로고침 (F5) — running 세션이 orphaned 상태로 남음
  4. 다시 주제 선택 → "학습 시작" 클릭
  5. **기대 결과**: "이미 진행 중인 세션이 있습니다" 에러 없이 새 세션 정상 시작
  6. 브라우저 개발자 도구 콘솔에서 복구 로그 확인 (`[Recovery]` 접두사)

- **빌드 검증**: `npm run build` 성공 확인

### Notes

- 브라우저 QA mode에서는 새로고침 시 in-memory store 자체가 비워지므로 orphaned 세션 문제가 발생하지 않음. 그러나 Tauri 구현과의 구조적 일관성을 위해 양쪽 구현.
- 향후 사용자에게 "이전 세션이 비정상 종료되었습니다" 알림을 표시하는 UX 개선 가능 (현재 Out of Scope).
