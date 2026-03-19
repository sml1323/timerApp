---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - /Users/imseungmin/work/bmad_test/_bmad-output/planning-artifacts/prd.md
  - /Users/imseungmin/work/bmad_test/_bmad-output/planning-artifacts/architecture.md
  - /Users/imseungmin/work/bmad_test/_bmad-output/planning-artifacts/ux-design-specification.md
---

# bmad_test - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for bmad_test, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

#### 학습 세션 관리
- FR1: 사용자는 학습을 시작하기 전에 주제를 선택할 수 있다.
- FR2: 사용자는 선택한 주제로 포모도로 학습 세션을 시작할 수 있다.
- FR3: 사용자는 학습 세션 진행 중 현재 남은 시간을 확인할 수 있다.
- FR4: 사용자는 학습 세션 완료 시 완료 상태를 확인할 수 있다.
- FR5: 사용자는 학습 세션 이후 휴식 세션으로 전환할 수 있다.
- FR6: 시스템은 완료된 학습 세션을 자동으로 기록할 수 있다.
- FR7: 시스템은 학습 세션과 휴식 세션을 구분해 처리할 수 있다.
- FR8: 사용자는 세션을 완료하지 못한 경우 현재 상태를 인지할 수 있다.

#### 주제 관리
- FR9: 사용자는 학습 주제를 생성할 수 있다.
- FR10: 사용자는 기존 학습 주제 목록을 확인할 수 있다.
- FR11: 사용자는 기존 학습 주제의 이름을 수정할 수 있다.
- FR12: 사용자는 더 이상 사용하지 않는 학습 주제를 정리할 수 있다.
- FR13: 사용자는 세션 시작 전 주제를 빠르게 선택할 수 있다.

#### 목표 관리
- FR14: 사용자는 주제별 주간 학습 목표 시간을 설정할 수 있다.
- FR15: 사용자는 주제별 현재 주간 목표 대비 진행 상태를 확인할 수 있다.
- FR16: 시스템은 주제별 누적 학습 시간과 주간 목표를 연결해 표시할 수 있다.
- FR17: 사용자는 목표를 달성하지 못한 날에도 주간 기준의 남은 목표를 확인할 수 있다.

#### 오늘 진행 상황 및 통계
- FR18: 사용자는 메인 화면에서 오늘 진행 상황을 확인할 수 있다.
- FR19: 사용자는 메인 화면에서 이번 주 목표 대비 전체 진척을 확인할 수 있다.
- FR20: 사용자는 주제별 누적 학습 시간을 확인할 수 있다.
- FR21: 사용자는 기본 통계 화면에서 전체 학습 진행 결과를 확인할 수 있다.
- FR22: 사용자는 오늘 기준과 주간 기준의 학습 상태를 구분해 확인할 수 있다.
- FR23: 시스템은 세션 완료 후 통계를 즉시 갱신할 수 있다.

#### 기록 정정 및 데이터 신뢰성
- FR24: 사용자는 완료된 세션 기록의 주제를 수정할 수 있다.
- FR25: 사용자는 완료된 세션 기록의 시간을 수정할 수 없다.
- FR26: 시스템은 기록의 주제가 변경되면 관련 통계를 일관되게 재계산할 수 있다.
- FR27: 시스템은 사용자가 기록을 신뢰할 수 있도록 세션 결과를 일관되게 유지할 수 있다.

#### 내비게이션 및 앱 구조
- FR28: 사용자는 메인 화면, 주제 관리 화면, 통계 화면 사이를 이동할 수 있다.
- FR29: 사용자는 학습 시작 전 주제 관리 화면에서 필요한 준비를 할 수 있다.
- FR30: 사용자는 학습 완료 후 통계 화면으로 이동해 결과를 검토할 수 있다.
- FR31: 시스템은 사용자가 실행 전, 실행 중, 실행 후 흐름을 끊김 없이 이어갈 수 있도록 주요 화면 구조를 제공할 수 있다.

#### 로컬 데이터 보존
- FR32: 시스템은 세션 기록을 로컬 저장소에 보존할 수 있다.
- FR33: 시스템은 주제 정보와 주간 목표 데이터를 로컬 저장소에 보존할 수 있다.
- FR34: 사용자는 앱을 재실행한 이후에도 기존 기록과 목표 데이터를 확인할 수 있다.
- FR35: 시스템은 네트워크 연결 없이도 핵심 데이터 기반 기능을 사용할 수 있게 할 수 있다.

#### 데스크톱 앱 동작 보조 기능
- FR36: 시스템은 macOS 환경에서 동작하는 데스크톱 앱으로 제공될 수 있다.
- FR37: 시스템은 인터넷 연결 없이도 핵심 학습 흐름을 지원할 수 있다.
- FR38: 시스템은 학습 세션 시작 및 종료와 관련된 기본 알림을 제공할 수 있다.
- FR39: 사용자는 복잡한 계정 생성이나 로그인 없이 앱을 사용할 수 있다.

### NonFunctional Requirements

- NFR1: 메인 화면은 사용자가 앱 실행 직후 오늘 진행 상황과 주간 진척을 빠르게 확인할 수 있을 정도로 지연 없이 표시되어야 한다.
- NFR2: 주제 선택, 화면 전환, 통계 화면 진입은 사용 흐름을 끊지 않을 정도로 즉각적으로 반응해야 한다.
- NFR3: 학습 세션 완료 후 기록 저장과 통계 반영은 사용자가 결과를 바로 확인할 수 있도록 즉시 처리되어야 한다.
- NFR4: 오프라인 상태에서도 핵심 사용자 흐름의 반응 속도는 네트워크 상태에 영향을 받아서는 안 된다.
- NFR5: 세션 기록, 주제 정보, 주간 목표 데이터는 사용자의 로컬 기기 내에서 보존되어야 한다.
- NFR6: 제품은 MVP 범위에서 계정 생성이나 원격 서버 저장을 요구하지 않아야 한다.
- NFR7: 사용자의 학습 데이터는 의도하지 않은 손실이나 손상 없이 유지되어야 한다.
- NFR8: 로컬 데이터 처리 방식은 제품 신뢰를 해치지 않도록 단순하고 예측 가능해야 한다.
- NFR9: 제품은 기본적인 macOS 접근성 요구를 충족해야 한다.
- NFR10: 주요 화면과 핵심 흐름은 시각적 정보에만 의존하지 않도록 구성되어야 한다.
- NFR11: 사용자는 기본적인 시스템 접근성 기능을 활용해 핵심 기능을 사용할 수 있어야 한다.

### Additional Requirements

Architecture 문서에서 추출한 구현에 영향을 주는 기술 요구사항:

- **스타터 템플릿**: Architecture에서 Tauri 2 + React + TypeScript 스타터를 지정함. `npm create tauri-app@latest` 사용. → Epic 1 Story 1에서 프로젝트 초기화 필수.
- 영속성은 embedded SQLite를 단일 사실원천(single source of truth)으로 사용한다.
- 타이머/세션 상태는 timestamp 기반으로 모델링한다 (incrementing counter 아님).
- MVP에 인증/인가 계층 없음.
- 프론트엔드-네이티브 통신은 Tauri capabilities/plugins와 thin typed wrapper를 사용한다.
- 프론트엔드는 React 19.x + TypeScript, React Router 7.x, Zustand 5.x를 사용한다.
- 검증은 Zod 4.x (TypeScript 경계) + DB constraints로 처리한다.
- 스타일링은 CSS Modules + CSS variables (utility-first 프레임워크 아님).
- CI는 GitHub Actions (validation + desktop build 분리).
- 경량 앱 설정은 Tauri Store 플러그인, 도메인 레코드는 SQLite에 저장.
- DB 마이그레이션은 앱 시작 시 forward-only SQL 마이그레이션으로 처리.
- 프로젝트는 feature/domain 기반 코드 구성 (file type 기반 아님).
- DB row ↔ TS 객체 매핑은 repository/adapter 경계에서만 수행.
- 비동기 경계는 discriminated result 객체 (`{ ok: true, data }` / `{ ok: false, code, message }`) 반환.
- 알림(Notification)은 선택적 보조 기능으로, 세션 상태 전이 후에만 발생.

### UX Design Requirements

- UX-DR1: Study Status Summary Card 구현 — 오늘 누적 시간, 이번 주 누적 시간, 목표 대비 진행률, 남은 목표를 한눈에 요약하는 홈 화면 최상단 컴포넌트. States: 기본, 목표 달성 근접, 목표 달성, 데이터 없음.
- UX-DR2: Topic Quick Select Panel 구현 — 주제 리스트, 주간 목표 요약, 최근 선택 표시, 시작 버튼을 포함하는 빠른 주제 선택 패널. 키보드 방향키/Enter 선택 지원 필수.
- UX-DR3: Session Focus Timer 구현 — 남은 시간, 현재 주제, 세션 상태, 진행 표시, 중단/종료 액션을 포함하는 집중 타이머. States: 시작 전, 진행 중, 일시 중단, 완료 직전, 완료.
- UX-DR4: Character State Panel 구현 — `default.svg`(홈/대기), `loading.svg`(세션 진행 중), `speak.svg`(완료/회복 피드백)를 사용하는 캐릭터 상태 패널. SVG만으로 의미 전달하지 않고 반드시 텍스트 동반.
- UX-DR5: Session Outcome Panel 구현 — 세션 종료 후 완료 여부, 추가된 시간, 목표 대비 변화, 다음 행동 CTA, 캐릭터 피드백을 포함하는 결과 패널. Variants: success, recovery.
- UX-DR6: Record Correction Item 구현 — 기록 수정 플로우를 위한 컴포넌트. 수정 가능 필드(주제)와 수정 불가 필드(시간)를 명확히 구분. 수정 후 통계 재계산 결과 즉시 반영.
- UX-DR7: 디자인 토큰 시스템 구현 — CSS variables 기반 color system (저채도 블루/틸 중심), typography system (시스템 산세리프), 8px 기반 spacing 체계 구축.
- UX-DR8: 빈 상태(Empty State) 처리 — `default.svg` 또는 `speak.svg`와 함께 첫 행동을 안내하는 빈 상태 UI. 단순 공백 금지.
- UX-DR9: 회복 중심 UX 피드백 — 목표 미달/세션 중단 시 실패감 대신 "이번 주 기준으로 다시 이어갈 수 있음"을 보여주는 피드백 문구와 정보 구조.
- UX-DR10: 반응형 창 크기 대응 — Wide Desktop / Standard Desktop / Compact Window 3단계 전략. 핵심 루프(`상태 확인 → 주제 선택 → 세션 시작`)는 어떤 창 크기에서도 유지.
- UX-DR11: 접근성 준수 (WCAG AA) — 텍스트/배경 대비 확보, 키보드 포커스 링, 키보드 전체 탐색 가능, VoiceOver 대응, 색상만으로 상태 전달 금지.
- UX-DR12: 버튼 계층 구조 — Primary(한 화면에 하나), Secondary, Text, Destructive 버튼 일관 적용. hover/focus/disabled 상태 일관 유지.
- UX-DR13: 세션 진행 중 내비게이션 축소 — 세션 집중 모드에서는 내비게이션 노출을 줄여 집중 우선. `loading.svg`와 함께 "집중 진행 중" 명시적 텍스트 동반.
- UX-DR14: 폼 패턴 일관성 — 주제 생성, 주제 수정, 목표 설정, 기록 정정 폼에서 인라인 검증, 명확한 레이블, 수정 가능/불가 구분 일관 적용.

### FR Coverage Map

- FR1: Epic 2 — 학습 시작 전 주제 선택
- FR2: Epic 3 — 선택한 주제로 포모도로 세션 시작
- FR3: Epic 3 — 세션 중 남은 시간 확인
- FR4: Epic 3 — 세션 완료 상태 확인
- FR5: Epic 3 — 휴식 세션 전환
- FR6: Epic 3 — 완료 세션 자동 기록
- FR7: Epic 3 — 학습/휴식 세션 구분 처리
- FR8: Epic 3 — 미완료 세션 상태 인지
- FR9: Epic 2 — 학습 주제 생성
- FR10: Epic 2 — 주제 목록 확인
- FR11: Epic 2 — 주제 이름 수정
- FR12: Epic 2 — 주제 정리(아카이브/삭제)
- FR13: Epic 2 — 세션 전 빠른 주제 선택
- FR14: Epic 4 — 주제별 주간 목표 설정
- FR15: Epic 4 — 주간 목표 대비 진행 상태 확인
- FR16: Epic 4 — 누적 학습 시간과 주간 목표 연결 표시
- FR17: Epic 4 — 목표 미달 시 주간 기준 남은 목표 확인
- FR18: Epic 5 — 메인 화면 오늘 진행 상황 확인
- FR19: Epic 5 — 메인 화면 주간 진척 확인
- FR20: Epic 5 — 주제별 누적 학습 시간 확인
- FR21: Epic 5 — 통계 화면 전체 진행 결과 확인
- FR22: Epic 5 — 오늘/주간 학습 상태 구분 확인
- FR23: Epic 5 — 세션 완료 후 통계 즉시 갱신
- FR24: Epic 6 — 세션 기록 주제 수정
- FR25: Epic 6 — 세션 기록 시간 수정 불가
- FR26: Epic 6 — 주제 변경 시 통계 재계산
- FR27: Epic 6 — 세션 결과 일관성 유지
- FR28: Epic 1 — 메인/주제/통계 화면 간 이동
- FR29: Epic 5 — 학습 전 주제 관리 화면 준비
- FR30: Epic 5 — 학습 후 통계 화면 검토
- FR31: Epic 1 — 실행 전/중/후 끊김 없는 화면 구조
- FR32: Epic 2, 3 — 세션/주제 기록 로컬 보존
- FR33: Epic 2, 4 — 주제/목표 데이터 로컬 보존
- FR34: Epic 2 — 앱 재실행 후 기록/목표 확인
- FR35: Epic 3 — 네트워크 없이 핵심 기능 사용
- FR36: Epic 1 — macOS 데스크톱 앱 제공
- FR37: Epic 1 — 인터넷 없이 핵심 흐름 지원
- FR38: Epic 3 — 세션 시작/종료 기본 알림
- FR39: Epic 1 — 계정/로그인 없이 앱 사용

## Epic List

### Epic 1: 프로젝트 초기화 및 앱 기반 구축
사용자가 macOS에서 앱을 실행하고 기본 화면 간 이동이 가능한 상태를 만든다.
**FRs:** FR28, FR31, FR36, FR37, FR39
**UX-DRs:** UX-DR7, UX-DR10, UX-DR12
**추가 요구사항:** Tauri 2 스타터 초기화, SQLite + 마이그레이션 구성, 기본 라우팅(홈/주제/통계), 앱 셸/내비게이션, 디자인 토큰 시스템

### Epic 2: 주제 생성 및 관리
사용자가 학습 주제를 생성, 확인, 수정, 정리하고 세션 시작 전 빠르게 주제를 선택할 수 있다.
**FRs:** FR1, FR9, FR10, FR11, FR12, FR13, FR32, FR33, FR34
**UX-DRs:** UX-DR2, UX-DR8, UX-DR14

### Epic 3: 학습 세션 실행 및 기록
사용자가 선택한 주제로 포모도로 세션을 시작하고, 진행 중 집중 상태를 유지하며, 완료 시 자동 기록이 저장된다.
**FRs:** FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR32, FR35, FR38
**UX-DRs:** UX-DR3, UX-DR4, UX-DR5, UX-DR9, UX-DR13
**NFRs:** NFR3, NFR4, NFR7

### Epic 4: 주간 목표 설정 및 진행 추적
사용자가 주제별 주간 학습 목표를 설정하고, 목표 대비 진행 상태를 확인하며, 목표 미달 상황에서도 주간 기준으로 이어갈 수 있다.
**FRs:** FR14, FR15, FR16, FR17, FR33
**UX-DRs:** UX-DR9
**NFRs:** NFR5

### Epic 5: 대시보드 및 통계
사용자가 메인 화면에서 오늘 진행 상황과 주간 진척을 확인하고, 통계 화면에서 전체 학습 결과를 검토할 수 있다.
**FRs:** FR18, FR19, FR20, FR21, FR22, FR23, FR29, FR30
**UX-DRs:** UX-DR1, UX-DR4, UX-DR11
**NFRs:** NFR1, NFR2

### Epic 6: 기록 정정 및 데이터 신뢰성
사용자가 완료된 세션 기록의 주제를 수정하고, 수정 후 통계가 일관되게 재계산된다.
**FRs:** FR24, FR25, FR26, FR27
**UX-DRs:** UX-DR6, UX-DR14

---

## Epic 1: 프로젝트 초기화 및 앱 기반 구축

사용자가 macOS에서 앱을 실행하고 기본 화면 간 이동이 가능한 상태를 만든다.

### Story 1.1: Tauri 2 프로젝트 초기화 및 개발 환경 구성

As a 개발자,
I want Tauri 2 + React + TypeScript 프로젝트를 초기화하고 개발 환경을 구성할 수 있기를,
So that 학습 앱 개발을 위한 기반이 마련된다.

**Acceptance Criteria:**

**Given** 빈 프로젝트 디렉터리가 있을 때
**When** `npm create tauri-app@latest`로 프로젝트를 초기화하면
**Then** React 19.x + TypeScript + Vite 기반 프론트엔드가 생성된다
**And** `src-tauri/` 디렉터리에 Rust 기반 Tauri 셸이 구성된다
**And** `npm run tauri dev`로 macOS 앱이 정상 실행된다
**And** React Router 7.x가 설치되고 기본 라우트(`/`, `/topics`, `/stats`)가 구성된다
**And** Zustand 5.x와 Zod 4.x가 설치된다
**And** Architecture 문서의 프로젝트 디렉터리 구조(`app/`, `features/`, `domain/`, `shared/`, `platform/`, `db/`)가 생성된다
**And** `.gitignore`와 기본 설정 파일이 구성된다

### Story 1.2: 디자인 토큰 시스템 및 공통 UI 기반 구축

As a 학습자,
I want 앱의 시각적 기반이 일관되게 구성되기를,
So that 모든 화면에서 차분하고 신뢰감 있는 학습 도구 경험을 받는다.

**Acceptance Criteria:**

**Given** 프로젝트가 초기화되었을 때
**When** 디자인 토큰 시스템을 구현하면
**Then** `tokens.css`에 색상(저채도 블루/틸 중심), 타이포그래피(시스템 산세리프), 8px 기반 spacing 변수가 정의된다
**And** `globals.css`에 전역 기본 스타일이 적용된다
**And** CSS Modules 기반 컴포넌트 스타일링 패턴이 설정된다
**And** Primary, Secondary, Text, Destructive 버튼 컴포넌트가 구현된다 (UX-DR12)
**And** 모든 버튼에 hover, focus, disabled 상태가 일관되게 적용된다
**And** 키보드 포커스 링이 명확하게 표시된다

### Story 1.3: 앱 셸, 내비게이션 및 라우팅 구현

As a 학습자,
I want 메인 화면, 주제 관리 화면, 통계 화면 사이를 자유롭게 이동할 수 있기를,
So that 학습 실행 전, 실행 중, 실행 후 흐름을 끊김 없이 이어갈 수 있다.

**Acceptance Criteria:**

**Given** 앱이 실행되었을 때
**When** 메인 내비게이션을 사용하면
**Then** 홈(`/`), 주제 관리(`/topics`), 통계(`/stats`) 화면으로 이동할 수 있다 (FR28)
**And** 현재 위치가 내비게이션에서 시각적으로 구분된다
**And** 현재 위치가 ARIA 상태로도 구분된다
**And** 존재하지 않는 경로 접근 시 NotFound 화면이 표시된다 (FR31)
**And** 앱 셸(AppShell)이 모든 라우트에 공통 레이아웃을 제공한다
**And** 로그인이나 계정 생성 없이 바로 앱을 사용할 수 있다 (FR39)
**And** 인터넷 연결 없이도 앱이 정상 실행된다 (FR37)
**And** Wide Desktop / Standard Desktop / Compact Window에서 레이아웃이 적절히 대응한다 (UX-DR10)

### Story 1.4: SQLite 데이터베이스 초기화 및 마이그레이션 시스템

As a 학습자,
I want 앱 재실행 후에도 데이터가 보존되기를,
So that 학습 기록과 목표를 신뢰하고 꾸준히 사용할 수 있다.

**Acceptance Criteria:**

**Given** 앱이 처음 실행될 때
**When** 데이터베이스 초기화가 진행되면
**Then** Tauri SQL 플러그인을 통해 SQLite DB가 앱 데이터 디렉터리에 생성된다
**And** forward-only SQL 마이그레이션 시스템이 앱 시작 시 자동 실행된다
**And** 초기 스키마 마이그레이션(`topics`, `weekly_goals`, `sessions` 테이블)이 실행된다
**And** 앱 재실행 시 이미 실행된 마이그레이션은 건너뛴다
**And** `src/platform/tauri/sql-client.ts` adapter가 구현되어 React 컴포넌트에서 직접 Tauri 플러그인을 호출하지 않는다
**And** DB 연결 실패 시 사용자에게 명확한 에러 메시지가 표시된다

---

## Epic 2: 주제 생성 및 관리

사용자가 학습 주제를 생성, 확인, 수정, 정리하고 세션 시작 전 빠르게 주제를 선택할 수 있다.

### Story 2.1: 주제 도메인 모델 및 저장소 구현

As a 학습자,
I want 학습 주제 데이터가 안정적으로 저장되고 관리되기를,
So that 앱을 재실행해도 내 주제 목록이 보존된다.

**Acceptance Criteria:**

**Given** `topics` 테이블이 DB에 존재할 때
**When** 주제 도메인 모듈을 구현하면
**Then** `src/domain/topics/topic.ts`에 Topic 타입이 정의된다 (id, name, isArchived, createdAtMs, updatedAtMs)
**And** `topic-schema.ts`에 Zod 검증 스키마가 정의된다
**And** `topic-repository.ts`에 CRUD 함수가 구현된다 (create, findAll, findById, update, archive)
**And** `topic-mappers.ts`에 DB row(`snake_case`) ↔ TS 객체(`camelCase`) 매핑이 구현된다
**And** 모든 repository 함수가 discriminated result 객체(`{ ok, data }` / `{ ok, code, message }`)를 반환한다
**And** 빈 이름이나 중복 이름에 대한 검증이 동작한다

### Story 2.2: 주제 생성 및 목록 화면 구현

As a 학습자,
I want 학습 주제를 생성하고 전체 주제 목록을 확인할 수 있기를,
So that 공부할 과목을 체계적으로 관리할 수 있다.

**Acceptance Criteria:**

**Given** 주제 관리 화면(`/topics`)에 접근했을 때
**When** 주제가 하나도 없으면
**Then** `default.svg` 캐릭터와 함께 "첫 학습 주제를 만들어보세요" 안내가 표시된다 (UX-DR8)
**And** 주제 생성 폼이 제공된다

**Given** 주제 생성 폼에 이름을 입력했을 때
**When** 저장 버튼을 누르면
**Then** 새 주제가 SQLite에 저장되고 목록에 즉시 나타난다 (FR9)
**And** 빈 이름 입력 시 인라인 검증 오류가 표시된다 (UX-DR14)
**And** 레이블이 폼 필드에 명확히 연결된다

**Given** 주제가 존재할 때
**When** 주제 목록 화면을 보면
**Then** 모든 활성 주제가 리스트로 표시된다 (FR10)
**And** 앱 재실행 후에도 목록이 보존된다 (FR34)

### Story 2.3: 주제 수정 및 정리 기능

As a 학습자,
I want 기존 주제의 이름을 수정하거나 사용하지 않는 주제를 정리할 수 있기를,
So that 주제 목록을 깔끔하게 유지할 수 있다.

**Acceptance Criteria:**

**Given** 주제 목록에서 특정 주제를 선택했을 때
**When** 수정 옵션을 선택하면
**Then** 주제 이름을 인라인 또는 다이얼로그로 수정할 수 있다 (FR11)
**And** 수정 후 목록에 즉시 반영된다
**And** 빈 이름으로 수정 시 검증 오류가 표시된다

**Given** 더 이상 사용하지 않는 주제가 있을 때
**When** 정리(아카이브) 옵션을 선택하면
**Then** 해당 주제가 주제 선택 목록에서 숨겨진다 (FR12)
**And** 기존 세션 기록과의 연결은 유지된다
**And** 데이터는 삭제되지 않고 아카이브 상태로 보존된다

### Story 2.4: 빠른 주제 선택 패널 구현

As a 학습자,
I want 세션 시작 전 빠르게 주제를 선택할 수 있기를,
So that 학습 시작까지의 마찰이 최소화된다.

**Acceptance Criteria:**

**Given** 홈 화면에서 세션을 시작하려 할 때
**When** Topic Quick Select Panel이 표시되면
**Then** 활성 주제 리스트가 표시된다 (FR1, FR13)
**And** 키보드 방향키와 Enter로 주제를 선택할 수 있다 (UX-DR2)
**And** 주제 선택 즉시 시작 CTA 버튼이 활성화된다
**And** 아카이브된 주제는 선택 목록에 나타나지 않는다
**And** 주제가 없을 때 빈 상태 안내가 표시된다 (UX-DR8)

---

## Epic 3: 학습 세션 실행 및 기록

사용자가 선택한 주제로 포모도로 세션을 시작하고, 진행 중 집중 상태를 유지하며, 완료 시 자동 기록이 저장된다.

### Story 3.1: 세션 도메인 모델 및 저장소 구현

As a 학습자,
I want 학습 세션 데이터가 안정적으로 저장되기를,
So that 세션 기록이 통계의 신뢰 가능한 단일 사실원천이 된다.

**Acceptance Criteria:**

**Given** `sessions` 테이블이 DB에 존재할 때
**When** 세션 도메인 모듈을 구현하면
**Then** `session.ts`에 Session 타입이 정의된다 (id, topicId, phaseType, status, startedAtMs, plannedDurationSec, endedAtMs)
**And** `session-schema.ts`에 Zod 검증 스키마가 정의된다
**And** `session-repository.ts`에 create, complete, interrupt, findByDateRange 함수가 구현된다
**And** `session-mappers.ts`에 DB ↔ TS 매핑이 구현된다
**And** `session-transitions.ts`에 상태 전이 규칙이 정의된다 (planned → running → completed/interrupted)
**And** 타이머는 timestamp 기반(`startedAtMs`, `plannedDurationSec`, `endedAtMs`)으로 모델링된다
**And** 모든 함수가 discriminated result 객체를 반환한다

### Story 3.2: 포모도로 타이머 및 집중 모드 UI 구현

As a 학습자,
I want 선택한 주제로 포모도로 학습 세션을 시작하고 남은 시간을 확인할 수 있기를,
So that 집중 상태를 유지하며 학습할 수 있다.

**Acceptance Criteria:**

**Given** 주제가 선택된 상태에서 시작 버튼을 누를 때
**When** 세션이 시작되면
**Then** Session Focus Timer가 남은 시간과 현재 주제를 표시한다 (FR2, FR3, UX-DR3)
**And** `loading.svg` 캐릭터가 "집중 진행 중" 텍스트와 함께 표시된다 (UX-DR4, UX-DR13)
**And** 내비게이션이 축소되어 집중 모드가 활성화된다 (UX-DR13)
**And** 타이머는 `startedAtMs`와 현재 시각의 차이로 남은 시간을 계산한다
**And** 세션 상태가 Zustand sessionStore에서 관리된다

**Given** 세션이 진행 중일 때
**When** 앱이 백그라운드 상태였다가 복귀하면
**Then** timestamp 기반 계산으로 정확한 남은 시간이 표시된다 (NFR4)

### Story 3.3: 세션 완료 및 자동 기록 저장

As a 학습자,
I want 세션 완료 시 기록이 자동 저장되고 전진 결과를 확인할 수 있기를,
So that 이번 주 목표를 향해 실제로 전진하고 있다는 성취감을 얻는다.

**Acceptance Criteria:**

**Given** 포모도로 타이머가 0에 도달했을 때
**When** 세션이 완료되면
**Then** 세션 기록이 SQLite에 자동 저장된다 (FR6, NFR3)
**And** Session Outcome Panel이 표시된다 (UX-DR5 — success variant)
**And** 완료된 시간, 주제명이 결과에 표시된다
**And** `speak.svg` 캐릭터가 짧은 성취 피드백 문구와 함께 표시된다 (UX-DR4)
**And** "다음 세션 시작" 또는 "통계 보기" CTA가 제공된다
**And** 데이터는 의도하지 않은 손실 없이 저장된다 (NFR7)
**And** macOS 알림으로 세션 완료가 통지된다 (FR38, 선택적)

### Story 3.4: 휴식 세션 및 학습/휴식 전환

As a 학습자,
I want 학습 세션 후 휴식 세션으로 전환할 수 있기를,
So that 학습과 휴식 리듬을 유지할 수 있다.

**Acceptance Criteria:**

**Given** 학습 세션이 완료된 후
**When** 휴식 세션 시작을 선택하면
**Then** 휴식 타이머가 시작된다 (FR5)
**And** 시스템이 학습 세션과 휴식 세션을 구분해 기록한다 (FR7)
**And** 휴식 세션 완료 시 다음 학습 세션 시작 CTA가 제공된다
**And** 휴식 시간은 학습 통계에 포함되지 않는다

### Story 3.5: 브라우저 검증용 런타임 분리 및 테스트 하니스

As a 개발자,
I want Tauri 전용 초기화와 분리된 브라우저 검증 경로를 갖추기를,
So that Home과 Session 핵심 흐름을 브라우저에서 빠르게 재현하고 회귀를 확인할 수 있다.

**Acceptance Criteria:**

**Given** 브라우저 런타임에서 앱을 열었을 때
**When** Tauri native API가 존재하지 않으면
**Then** 앱이 bootstrap 단계에서 실패하지 않고 internal QA 검증 경로로 진입한다

**And** Tauri runtime에서는 기존 SQLite 초기화, migration, notification 동작이 유지된다
**And** 브라우저 검증 경로는 mock/in-memory adapter 또는 동등한 harness를 사용해 Home -> 주제 선택 -> 학습 시작 -> 세션 완료 -> 휴식 시작 흐름을 재현할 수 있다
**And** browser 검증 모드는 사용자 제공 플랫폼 범위가 아니라 internal QA 용으로만 노출된다
**And** 새로운 runtime seam이 UI에서 Tauri plugin 직접 호출을 늘리지 않는다

### Story 3.6: 세션 중단 및 회복 플로우

As a 학습자,
I want 세션을 끝까지 완료하지 못해도 현재 상태를 이해하고 다시 이어갈 수 있기를,
So that 중단이 실패가 아니라 재시작 가능한 상황으로 느껴진다.

**Acceptance Criteria:**

**Given** 세션이 진행 중일 때
**When** 사용자가 중단 버튼을 누르면
**Then** 세션이 interrupted 상태로 기록된다 (FR8)
**And** Session Outcome Panel이 recovery variant로 표시된다 (UX-DR5)
**And** `speak.svg` 캐릭터가 회복 메시지를 제공한다 (UX-DR9)
**And** "이번 주 기준 남은 목표"와 재시작 가능성이 표시된다
**And** "바로 재시작", "다른 주제 선택", "오늘은 종료" 선택지가 제공된다
**And** 실패감이 아닌 회복 가능성 중심의 문구가 사용된다 (UX-DR9)

---

## Epic 4: 주간 목표 설정 및 진행 추적

사용자가 주제별 주간 학습 목표를 설정하고, 목표 대비 진행 상태를 확인하며, 목표 미달 상황에서도 주간 기준으로 이어갈 수 있다.

### Story 4.1: 주간 목표 도메인 모델 및 저장소 구현

As a 학습자,
I want 주간 목표 데이터가 안정적으로 저장되기를,
So that 앱 재실행 후에도 목표가 보존된다.

**Acceptance Criteria:**

**Given** `weekly_goals` 테이블이 DB에 존재할 때
**When** 목표 도메인 모듈을 구현하면
**Then** `weekly-goal.ts`에 WeeklyGoal 타입이 정의된다 (id, topicId, weekStartAtMs, targetMinutes)
**And** `weekly-goal-schema.ts`에 Zod 검증 스키마가 정의된다 (양수 목표 분, 유효한 주 시작일)
**And** `weekly-goal-repository.ts`에 create, update, findByTopicAndWeek 함수가 구현된다
**And** `weekly-goal-mappers.ts`에 DB ↔ TS 매핑이 구현된다
**And** 모든 함수가 discriminated result 객체를 반환한다

### Story 4.2: 주간 목표 설정 UI 구현

As a 학습자,
I want 주제별 주간 학습 목표 시간을 설정할 수 있기를,
So that 이번 주에 얼마나 공부할지 명확한 기준이 생긴다.

**Acceptance Criteria:**

**Given** 주제가 존재할 때
**When** 목표 설정 다이얼로그를 열면
**Then** 주제별 주간 목표 시간(분)을 설정할 수 있다 (FR14)
**And** 0 이하의 값 입력 시 인라인 검증 오류가 표시된다
**And** 저장 후 목표가 SQLite에 보존된다 (FR33, NFR5)
**And** 이미 설정된 목표가 있으면 현재 값이 표시된다

### Story 4.3: 주간 목표 대비 진행 상태 표시

As a 학습자,
I want 주제별 주간 목표 대비 진행 상태를 확인할 수 있기를,
So that 목표를 달성하지 못한 날에도 주간 기준으로 남은 목표를 파악하고 이어갈 수 있다.

**Acceptance Criteria:**

**Given** 주간 목표가 설정된 주제가 있을 때
**When** 홈 또는 주제 관련 화면에서 목표 진행률이 표시되면
**Then** 주제별 누적 학습 시간과 주간 목표가 연결되어 표시된다 (FR15, FR16)
**And** 목표 미달 시에도 "이번 주 남은 목표" 형태로 표시된다 (FR17)
**And** 회복 중심 문구가 사용된다 (UX-DR9)
**And** 진행률은 `sessions` 테이블에서 파생 계산된다

---

## Epic 5: 대시보드 및 통계

사용자가 메인 화면에서 오늘 진행 상황과 주간 진척을 확인하고, 통계 화면에서 전체 학습 결과를 검토할 수 있다.

### Story 5.1: 통계 도메인 모델 및 쿼리 구현

As a 학습자,
I want 학습 통계가 세션 기록에서 정확하게 계산되기를,
So that 통계를 신뢰하고 학습 판단에 활용할 수 있다.

**Acceptance Criteria:**

**Given** 세션 기록이 존재할 때
**When** 통계 도메인 모듈을 구현하면
**Then** `statistics-repository.ts`에 오늘 누적 시간, 주간 누적 시간, 주제별 누적 시간 쿼리가 구현된다
**And** 통계는 `sessions` 테이블에서 파생 계산된다 (단일 사실원천 원칙)
**And** 무거운 집계는 SQL 쿼리에서 처리된다
**And** 학습 세션만 통계에 포함되고 휴식 세션은 제외된다
**And** `statistics-mappers.ts`에 DB ↔ TS 매핑이 구현된다

### Story 5.2: 홈 대시보드 — Study Status Summary Card

As a 학습자,
I want 앱을 열면 오늘 진행 상황과 이번 주 목표 대비 진척을 즉시 확인할 수 있기를,
So that 지금 내가 어느 정도 하고 있는지 바로 이해할 수 있다.

**Acceptance Criteria:**

**Given** 홈 화면(`/`)에 접근했을 때
**When** Study Status Summary Card가 표시되면
**Then** 오늘 누적 시간이 표시된다 (FR18)
**And** 이번 주 목표 대비 전체 진척률이 표시된다 (FR19)
**And** 남은 목표가 표시된다 (UX-DR1)
**And** `default.svg` 캐릭터가 현재 상태 보조로 표시된다 (UX-DR4)
**And** 데이터 없음 상태에서는 빈 상태 안내가 표시된다 (UX-DR1 — 데이터 없음 state)
**And** 메인 화면이 지연 없이 빠르게 표시된다 (NFR1)
**And** 진행률은 색상 외 수치/레이블로도 표현된다 (UX-DR11)

### Story 5.3: 통계 화면 구현

As a 학습자,
I want 통계 화면에서 전체 학습 진행 결과를 검토할 수 있기를,
So that 학습 루틴이 유지되고 있다는 성취감과 동기부여를 얻는다.

**Acceptance Criteria:**

**Given** 통계 화면(`/stats`)에 접근했을 때
**When** 통계 데이터가 표시되면
**Then** 주제별 누적 학습 시간이 표시된다 (FR20)
**And** 전체 학습 진행 결과가 요약되어 표시된다 (FR21)
**And** 오늘 기준과 주간 기준의 학습 상태가 구분되어 표시된다 (FR22)
**And** 화면 전환 시 즉각적으로 반응한다 (NFR2)
**And** 키보드로 탐색 가능하다 (UX-DR11)

### Story 5.4: 세션 완료 후 통계 즉시 갱신

As a 학습자,
I want 세션 완료 직후 통계가 즉시 갱신되기를,
So that 방금 한 학습이 목표에 반영된 것을 바로 확인할 수 있다.

**Acceptance Criteria:**

**Given** 세션이 완료되어 기록이 저장된 후
**When** 홈 또는 통계 화면으로 이동하면
**Then** 오늘 누적, 주간 진척, 주제별 통계가 즉시 갱신되어 표시된다 (FR23)
**And** 통계 재계산은 persisted records에서 수행된다
**And** 학습 시작 전 주제 관리 화면 진입이 가능하다 (FR29)
**And** 학습 완료 후 통계 화면으로 직접 이동해 결과를 검토할 수 있다 (FR30)

---

## Epic 6: 기록 정정 및 데이터 신뢰성

사용자가 완료된 세션 기록의 주제를 수정하고, 수정 후 통계가 일관되게 재계산된다.

### Story 6.1: 세션 기록 목록 및 주제 수정 기능

As a 학습자,
I want 완료된 세션 기록의 주제를 수정할 수 있기를,
So that 잘못 선택한 주제가 통계를 왜곡하지 않고 기록을 신뢰할 수 있다.

**Acceptance Criteria:**

**Given** 기록 또는 통계 상세 화면에서 세션 기록 목록이 표시될 때
**When** 특정 기록의 수정 옵션을 선택하면
**Then** Record Correction Item이 표시된다 (UX-DR6)
**And** 주제 필드는 수정 가능하고 다른 주제를 선택할 수 있다 (FR24)
**And** 시간 필드는 수정 불가로 표시되며 이유가 안내된다 (FR25)
**And** 수정 가능/불가 상태가 시각적·텍스트로 명확히 구분된다
**And** 폼 필드에 명확한 레이블이 연결된다 (UX-DR14)

### Story 6.2: 기록 수정 후 통계 재계산

As a 학습자,
I want 기록 수정 후 통계가 일관되게 재계산되기를,
So that 기록 정정 후에도 통계를 신뢰할 수 있다.

**Acceptance Criteria:**

**Given** 세션 기록의 주제가 변경된 후
**When** 저장 버튼을 누르면
**Then** 기록이 업데이트되고 관련 통계가 자동 재계산된다 (FR26)
**And** `speak.svg` 캐릭터가 정정 완료를 안내한다
**And** 업데이트된 기록과 재계산된 통계 결과를 바로 확인할 수 있다
**And** 세션 결과가 일관되게 유지된다 (FR27)
**And** 재계산은 `sessions` 테이블 기준으로 처리된다 (단일 사실원천)
