# Sprint Change Proposal — Story 3.4 Browser Test Recovery

작성일: 2026-03-19  
워크플로: `bmad-correct-course`  
작업 모드: Batch 가정

## 1. Issue Summary

### 변경 트리거

- 현재 활성 스토리: `Story 3.4: 휴식 세션 및 학습/휴식 전환`
- 발견 시점: 2026-03-19 검증 단계
- 이슈 유형: 구현 중 발견된 기술 제약 / 기존 접근의 한계

### 문제 정의

현재 앱은 브라우저 런타임에서도 시작 직후 Tauri 전용 SQLite 초기화를 강제한다. 그 결과 브라우저에서는 Home / Session 플로우에 진입하기도 전에 부팅이 실패하며, `Story 3.4`의 수동 검증과 이후 회귀 확인이 막혀 있다.

이 문제는 제품 범위를 웹으로 확장하자는 요구가 아니다. 목적은 다음 두 가지다.

1. Tauri runtime에서의 기존 SQLite + migration + notification 동작을 유지한다.
2. 브라우저에서는 internal QA 용 mock/in-memory runtime 또는 test harness로 Home / Session 흐름을 확인할 수 있게 한다.

### 근거

- `src/main.tsx`는 앱 시작 시 항상 `initializeDatabase()`를 호출한다.
- `src/db/bootstrap/initializeDatabase.ts`는 즉시 `getDb()`를 호출한다.
- `src/platform/tauri/sql-client.ts`는 `@tauri-apps/plugin-sql`의 `Database.load()`에 직접 의존한다.
- 브라우저 재현 결과:
  - 확인 일시: 2026-03-19
  - 확인 환경: `npm run dev` + Playwright browser check
  - 결과: 초기 화면에서 `데이터베이스 초기화에 실패했습니다`
  - 콘솔 오류: `TypeError: Cannot read properties of undefined (reading 'invoke')`
  - 호출 경로: `@tauri-apps/plugin-sql` -> `src/platform/tauri/sql-client.ts` -> `src/db/bootstrap/initializeDatabase.ts` -> `src/main.tsx`

## 2. Impact Analysis

### Epic Impact

#### Epic 3 영향

- `Story 3.4` 구현 코드는 대부분 완료됐지만, 검증 경로가 막혀 상태를 `done`/`review`로 올리기 어렵다.
- 기존 중단/회복 플로우 스토리도 같은 Session runtime seam을 재사용할 가능성이 높다.
- 따라서 Epic 3 내부 우선순위를 잠시 재조정해 브라우저 검증 복구 작업을 먼저 처리하는 것이 타당하다.

#### Epic 4 영향

- 직접 영향은 없다.
- 단, 현재 스프린트에서 브라우저 검증 seam을 만들면 이후 목표 화면 UI를 브라우저에서 확인하기 쉬워진다.

#### Epic 5 영향

- `Story 5.2` 홈 대시보드와 `Story 5.4` 세션 완료 후 통계 갱신 확인에 직접적인 선행 기반이 된다.
- 브라우저에서 Home 화면이 부팅되지 않으면 Epic 5의 UI 검증 속도도 계속 낮아진다.

#### Epic 6 영향

- 직접 영향은 낮다.
- 다만 기록 정정 이후 통계 반영 흐름을 검증할 때도 같은 runtime seam이 재사용될 수 있다.

### Artifact Conflicts

#### PRD

- 핵심 제품 범위와는 충돌하지 않는다.
- 제품은 여전히 macOS 전용이며, 브라우저 모드는 사용자 제공 기능이 아니라 internal QA/검증 수단이어야 한다.
- PRD에는 이 점을 명시적으로 보강하는 정도의 최소 수정만 권장한다.

#### Architecture

- 현재 문서는 Tauri adapter 경계를 잘 정의했지만, runtime-aware bootstrap과 browser 검증 경로는 정의하지 않았다.
- `Testing Framework` 및 `Development Experience` 설명은 브라우저 하니스 사용 전략을 아직 담고 있지 않다.
- `Architecture Readiness Assessment`의 “blocker 수준 문제 없음” 판단은 이번 구현 현실과 일부 어긋난다.

#### UX Design

- 핵심 UX 플로우는 Home -> Topic Select -> Session -> Outcome -> Next Action으로 정의돼 있다.
- 그러나 `Testing Strategy`에는 브라우저 검증 하니스에서 이 핵심 루프를 확인하는 절차가 빠져 있다.

#### Secondary Artifacts

- `Story 3.4` 구현 산출물의 검증 섹션 업데이트 필요
- `sprint-status.yaml` 우선순위/스토리 추가 반영 필요
- 이후 Story 생성 시 browser harness를 재사용한다는 핸드오프 메모 필요

### Technical Impact

- 앱 bootstrap 경계 분리 필요
- Tauri 전용 adapter와 browser 검증용 adapter/harness를 구분하는 runtime seam 필요
- Topic / Session 흐름에서 사용할 최소 in-memory persistence 필요
- Home / Session / Outcome 흐름을 seed data로 재현할 수 있어야 함

## 3. Path Forward Evaluation

### Option 1: Direct Adjustment

평가: Viable  
Effort: Medium  
Risk: Medium-Low

설명:

- 현재 스프린트 안에서 브라우저 검증 복구를 우선순위 상단으로 올린다.
- `Story 3.4`는 유지하되, 그 앞에 실행할 기술 enabler를 추가하거나 `Story 3.4`의 선행 태스크로 명시한다.
- Tauri 동작은 그대로 유지하고, 브라우저에서는 internal QA 전용 in-memory adapter/harness를 붙인다.

장점:

- 기존 Story 3.4 구현 자산을 버리지 않는다.
- Epic 3, 5의 UI 검증 속도를 동시에 개선한다.
- 제품 범위(macOS 전용)를 건드리지 않는다.

주의:

- browser path와 Tauri path가 장기적으로 분기되지 않도록 seam을 좁게 유지해야 한다.

### Option 2: Potential Rollback

평가: Not viable  
Effort: High  
Risk: High

설명:

- Story 3.4 변경분을 되돌리고 Tauri-only 검증으로 회귀하는 선택지는 현재 문제를 해결하지 못한다.
- 브라우저 검증 차단은 Story 3.4만의 문제가 아니라 이후 홈/세션 UI 확인에도 반복될 가능성이 높다.

### Option 3: PRD MVP Review

평가: Not viable  
Effort: Low  
Risk: Medium

설명:

- MVP를 줄여 브라우저 검증을 포기하는 방식은 단기적으로는 쉬워 보이지만, 향후 UI 회귀 확인 속도를 계속 낮춘다.
- 현재 이슈는 제품 목표가 아니라 검증 인프라 부족이 원인이므로 MVP 축소 사안이 아니다.

### Recommended Path

선택: `Option 1 - Direct Adjustment`  
운영 형태: `Hybrid` (우선순위 재조정 + 기술 enabler 추가)

권장 판단:

- 현재 스프린트에 `브라우저 검증용 런타임 어댑터 및 테스트 하니스` 작업을 즉시 삽입한다.
- 추적 단위는 아래 둘 중 하나가 가능하다.

권장안:

- 새 `Story 3.5`를 technical story로 추가하고 현재 active priority로 전환

대안:

- `Story 3.4` 내부에 browser recovery task 묶음을 추가하고 그 태스크를 먼저 수행

본 제안서는 추적 명확성을 위해 새 `Story 3.5` 추가와 기존 회복 플로우의 `Story 3.6` 재번호 부여를 권장한다.

## 4. Detailed Change Proposals

## 4.1 Stories / Sprint Tracking

### Proposal A — New Story Addition

#### NEW

```md
### Story 3.5: 브라우저 검증용 런타임 분리 및 테스트 하니스

As a 개발자,
I want Tauri 전용 초기화와 분리된 브라우저 검증 경로를 갖추기를,
So that Home / Session 핵심 흐름을 브라우저에서 빠르게 재현하고 회귀를 확인할 수 있다.

**Acceptance Criteria:**

**Given** 브라우저 런타임에서 앱을 열었을 때
**When** Tauri native API가 존재하지 않으면
**Then** 앱이 bootstrap 단계에서 실패하지 않고 internal QA 검증 경로로 진입한다

**And** Tauri runtime에서는 기존 SQLite 초기화, migration, notification 동작이 유지된다
**And** 브라우저 검증 경로는 mock/in-memory adapter 또는 동등한 harness를 사용해 Home -> topic select -> study start -> study complete -> break start 흐름을 재현할 수 있다
**And** browser 검증 모드는 사용자 제공 플랫폼 범위가 아니라 internal QA 용으로만 노출된다
**And** 새로운 runtime seam이 UI에서 Tauri plugin 직접 호출을 늘리지 않는다
```

#### sprint-status.yaml update (approved 이후 반영)

```yaml
development_status:
  epic-3: in-progress
  3-4-휴식-세션-및-학습-휴식-전환: in-progress
  3-5-브라우저-검증용-런타임-분리-및-테스트-하니스: in-progress
  3-6-세션-중단-및-회복-플로우: backlog
```

비고:

- 현 tracker에는 `blocked` 상태가 없으므로 `Story 3.4`는 `in-progress` 유지가 현실적이다.
- 현재 실제 집중 작업 대상은 새 `Story 3.5`로 전환한다.

### Proposal B — Story 3.4 Validation Scope Adjustment

Story 파일: `3-4-휴식-세션-및-학습-휴식-전환.md`

#### OLD

```md
- [ ] 6.3 수동 플로우 확인: study 완료 -> `휴식 시작` -> break running -> break 완료 -> `다음 학습 시작`
- [ ] 6.4 수동 플로우 확인: break 진행 중 문구가 `휴식 진행 중`이고, 완료 후 요약에 `휴식 완료`가 표시되는지 확인
```

#### NEW

```md
- [ ] 6.3 Tauri runtime 수동 플로우 확인: study 완료 -> `휴식 시작` -> break running -> break 완료 -> `다음 학습 시작`
- [ ] 6.4 Browser QA harness 플로우 확인: Home -> 주제 선택 -> `학습 시작` -> Session running -> study 완료 -> `휴식 시작`
- [ ] 6.5 Browser QA harness 플로우 확인: break 진행 중 문구가 `휴식 진행 중`이고, 완료 후 요약에 `휴식 완료`가 표시되는지 확인
- [ ] 6.6 Browser QA mode가 internal-only 경로/플래그로 제한되는지 확인
```

## 4.2 PRD

권장 수정 범위: 최소 수정

파일: `prd.md`  
섹션: `Desktop App Specific Requirements > Project-Type Overview`

#### OLD

```md
bmad_test는 macOS 전용 개인 학습 앱으로 설계된다. 제품의 핵심 가치는 빠른 실행, 로컬 중심 데이터 보존, 방해 없는 학습 흐름 제공에 있다. 따라서 브라우저 기반 경험이나 다중 플랫폼 추상화보다, macOS 환경에서 자연스럽고 안정적으로 동작하는 데 우선순위를 둔다.
```

#### NEW

```md
bmad_test는 macOS 전용 개인 학습 앱으로 설계된다. 제품의 핵심 가치는 빠른 실행, 로컬 중심 데이터 보존, 방해 없는 학습 흐름 제공에 있다. 따라서 브라우저 기반 사용자 경험이나 다중 플랫폼 제품화보다, macOS 환경에서 자연스럽고 안정적으로 동작하는 데 우선순위를 둔다. 다만 internal QA와 회귀 확인을 위해 브라우저 기반 검증 하니스 또는 mock runtime을 둘 수 있으며, 이는 사용자 제공 플랫폼 범위에 포함하지 않는다.
```

수정 이유:

- 브라우저 하니스가 제품 플랫폼 확장으로 오해되지 않게 한다.

## 4.3 Architecture

### Change 1 — Testing Framework

파일: `architecture.md`  
섹션: `Testing Framework`

#### OLD

```md
스타터 자체가 강한 테스트 체계를 고정하지 않으므로, 이후 아키텍처 결정 단계에서 UI 테스트와 도메인 테스트 전략을 별도로 정하는 것이 적절하다.
```

#### NEW

```md
스타터 자체가 강한 테스트 체계를 고정하지 않으므로, UI 테스트와 도메인 테스트 전략은 별도로 정의한다. 제품 runtime은 Tauri를 기준으로 유지하되, 핵심 Home / Session 흐름의 빠른 회귀 확인을 위해 브라우저 기반 internal QA harness 또는 mock runtime을 둘 수 있다. 이 경로는 사용자 제공 플랫폼이 아니라 검증 도구이며, Tauri runtime과 동일한 service / state 흐름을 최대한 재사용해야 한다.
```

### Change 2 — Development Experience

파일: `architecture.md`  
섹션: `Development Experience`

#### OLD

```md
컴포넌트 개발은 React/Vite 흐름으로 빠르게 반복 가능하고, 데스크톱 동작은 Tauri 개발 서버로 검증할 수 있다. 이후 필요 시 공식 Tauri 플러그인으로 `store`, `notification`을 도입하기 쉽다.
```

#### NEW

```md
컴포넌트 개발은 React/Vite 흐름으로 빠르게 반복 가능하고, 데스크톱 동작은 Tauri 개발 서버로 검증할 수 있다. 또한 Tauri native API가 없는 환경에서도 핵심 Home / Session 플로우를 확인할 수 있도록 browser QA harness를 둘 수 있다. native persistence / notification 검증은 Tauri runtime에서 계속 수행하고, browser harness는 UI 흐름과 상태 전이 회귀 확인에 한정한다.
```

### Change 3 — Boundary Design

파일: `architecture.md`  
섹션: `API & Communication Patterns > Boundary Design`

#### OLD

```md
- Create thin typed adapter modules in the frontend for:
  - database access
  - notification access
  - future native integrations
- UI components must not call plugin APIs directly
```

#### NEW

```md
- Create thin typed adapter modules in the frontend for:
  - runtime detection / bootstrap
  - database or in-memory persistence access
  - notification access
  - future native integrations
- UI components must not call plugin APIs directly
- Tauri-specific adapters and browser QA adapters must be selected behind a narrow runtime seam
```

### Change 4 — Gap Analysis

파일: `architecture.md`  
섹션: `Important Gaps`

#### OLD

```md
- 테스트 러너 선택이 아직 고정되지 않았다.
- lint/format 조합에서 formatter 선택이 아직 명시되지 않았다.
- Tauri capability 파일의 실제 scope 항목은 첫 구현 story에서 구체화해야 한다.
```

#### NEW

```md
- 테스트 러너 선택이 아직 고정되지 않았다.
- browser QA harness / mock runtime 전략이 아직 구현되지 않았다.
- lint/format 조합에서 formatter 선택이 아직 명시되지 않았다.
- Tauri capability 파일의 실제 scope 항목은 첫 구현 story에서 구체화해야 한다.
```

## 4.4 UX Design

파일: `ux-design-specification.md`  
섹션: `Testing Strategy`

#### OLD

```md
반응형 테스트는 여러 창 크기에서 홈, 세션 진행, 통계, 기록 정정 화면이 어떻게 재배치되는지 검증하는 방식으로 진행한다. 접근성 테스트는 키보드만으로 핵심 플로우를 끝까지 수행할 수 있는지, VoiceOver 환경에서 주요 상태와 수치가 올바르게 읽히는지, 색상 대비와 포커스 표시가 충분한지를 확인해야 한다. 특히 세션 진행 중 상태, 완료 피드백, 기록 정정 제한 안내 같은 주요 상태 전환은 시각적 변화 없이도 이해 가능한지 검증해야 한다.
```

#### NEW

```md
반응형 테스트는 여러 창 크기에서 홈, 세션 진행, 통계, 기록 정정 화면이 어떻게 재배치되는지 검증하는 방식으로 진행한다. 접근성 테스트는 키보드만으로 핵심 플로우를 끝까지 수행할 수 있는지, VoiceOver 환경에서 주요 상태와 수치가 올바르게 읽히는지, 색상 대비와 포커스 표시가 충분한지를 확인해야 한다. 특히 세션 진행 중 상태, 완료 피드백, 기록 정정 제한 안내 같은 주요 상태 전환은 시각적 변화 없이도 이해 가능한지 검증해야 한다. 추가로 internal QA용 브라우저 harness에서는 `홈 -> 주제 선택 -> 학습 시작 -> 세션 완료 -> 휴식 시작` 핵심 루프와 `휴식 진행 중` / `휴식 완료` 문구를 빠르게 회귀 확인할 수 있어야 한다.
```

수정 이유:

- UX 문서의 핵심 루프 검증 전략에 browser QA 경로를 명시한다.

## 4.5 Recommended Implementation Scope

### In Scope

- Tauri runtime과 browser QA runtime을 구분하는 bootstrap seam 추가
- 브라우저에서 앱이 부팅 실패하지 않도록 초기화 경로 분리
- Topic / Session 흐름에 필요한 최소 mock/in-memory persistence 구현
- Home -> Session -> Outcome -> Break 전환 확인 가능한 internal harness 또는 runtime mode 추가
- `Story 3.4` 검증 태스크를 browser QA 기준으로 보강
- 관련 문서 및 sprint tracking 업데이트

### Out of Scope

- 웹 제품 버전 개발
- SQLite를 브라우저에서 그대로 에뮬레이션하는 범용 SQL mock 작성
- 통계 / 주간 목표 / 기록 정정 전체를 이번 변경 범위에 포함
- Playwright/Vitest 등 새 테스트 체계 전체 도입
- Tauri persistence 또는 notification 동작 재설계

### Preferred Technical Shape

권장 구현 방식:

- SQL query 문자열을 브라우저에서 흉내 내는 low-level `sql-client` mock보다는,
- `runtime-aware repository adapter` 또는 `in-memory domain adapter + harness` 조합을 권장한다.

이유:

- 현재 repository들이 raw SQL을 직접 사용하므로 SQL 레벨 mock은 유지보수 비용이 높다.
- 반면 Topic / Session 도메인에 필요한 최소 동작만 in-memory로 제공하면 Home / Session 흐름 검증에 충분하다.
- Tauri path와 browser QA path의 역할을 분리하기 쉽다.

### Suggested File-Level Scope

- `src/main.tsx`
- `src/db/bootstrap/*`
- `src/platform/runtime/*` 또는 이에 준하는 runtime selector 모듈
- `src/platform/tauri/*` 보완
- `src/domain/topics/*` 또는 topic runtime adapter 추가 구간
- `src/domain/sessions/*` 또는 session runtime adapter 추가 구간
- `src/app/router.tsx` 또는 internal harness 진입점
- `tests/*` 중 runtime selection / flow smoke 확인 보강

## 5. Implementation Handoff

### Scope Classification

`Moderate`

이유:

- 제품 목표나 MVP를 바꾸는 수준은 아니다.
- 하지만 backlog 재조정과 문서/스토리/아키텍처 반영이 함께 필요하다.

### Role Handoff

- Development:
  - runtime seam 구현
  - browser QA harness 또는 in-memory adapter 구현
  - Home / Session flow 검증
- Product Owner / Scrum Master:
  - 새 `Story 3.5` 추가 또는 `Story 3.4` task 재구성
  - 현재 스프린트 우선순위 재정렬
  - `sprint-status.yaml` 갱신
- Architect:
  - runtime seam이 Tauri adapter 경계를 훼손하지 않는지 검토

### Success Criteria

- 브라우저에서 앱이 bootstrap error 없이 진입한다
- internal QA 경로에서 Home / Session 핵심 플로우를 재현할 수 있다
- `휴식 시작`, `휴식 진행 중`, `휴식 완료`, `다음 학습 시작` 문구를 브라우저에서 확인할 수 있다
- Tauri runtime에서 기존 DB 초기화와 세션 흐름이 그대로 유지된다
- 브라우저 검증 경로가 제품 플랫폼 범위로 오해되지 않도록 문서가 정리된다

## 6. Checklist Status

### 1. Understand the Trigger and Context

- `[x]` 1.1 Trigger story identified: Story 3.4
- `[x]` 1.2 Core problem defined: browser bootstrap blocked by Tauri-only DB init
- `[x]` 1.3 Evidence gathered: code path + Playwright reproduction

### 2. Epic Impact Assessment

- `[x]` 2.1 Current epic impact evaluated
- `[x]` 2.2 Epic-level change identified: add/resequence technical enabler
- `[x]` 2.3 Future epics reviewed
- `[x]` 2.4 No future epic invalidated; no MVP replan required
- `[x]` 2.5 Priority resequencing recommended inside Epic 3

### 3. Artifact Conflict and Impact Analysis

- `[x]` 3.1 PRD conflict reviewed
- `[x]` 3.2 Architecture conflict reviewed
- `[x]` 3.3 UX impact reviewed
- `[x]` 3.4 Secondary artifact impact reviewed

### 4. Path Forward Evaluation

- `[x]` 4.1 Direct adjustment viable
- `[x]` 4.2 Rollback not viable
- `[x]` 4.3 PRD MVP review not viable
- `[x]` 4.4 Recommended path selected

### 5. Sprint Change Proposal Components

- `[x]` 5.1 Issue summary created
- `[x]` 5.2 Epic/artifact impact documented
- `[x]` 5.3 Recommended path documented
- `[x]` 5.4 MVP impact and action plan defined
- `[x]` 5.5 Handoff plan defined

### 6. Final Review and Handoff

- `[x]` 6.1 Checklist reviewed
- `[x]` 6.2 Proposal reviewed for consistency
- `[!]` 6.3 User approval pending
- `[!]` 6.4 `sprint-status.yaml` update pending approval

## 7. Approval Request

승인 시 다음 순서로 후속 반영을 진행한다.

1. `epics.md`에 새 `Story 3.5` 추가 또는 `Story 3.4` task 구조 조정
2. `architecture.md`, `ux-design-specification.md`, 필요 시 `prd.md` 문구 반영
3. `sprint-status.yaml` 업데이트
4. 필요하면 새 스토리 파일 생성 후 구현 착수
