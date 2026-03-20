# bmad_test — 프로젝트 문서 인덱스

> 생성일: 2026-03-20 | 스캔 레벨: exhaustive | 스캔 모드: initial_scan

## 프로젝트 개요

- **타입:** Monolith (단일 코드베이스)
- **플랫폼:** Desktop (Tauri 2 + React 19 + TypeScript)
- **아키텍처:** Feature/Domain 기반 레이어드 아키텍처
- **DB:** SQLite (embedded, 단일 사실원천)

## 빠른 참조

| 항목 | 값 |
|------|-----|
| **기술 스택** | Tauri 2, React 19, TypeScript 5.8, Vite 7, Zustand 5, React Router 7, Zod 4 |
| **진입점** | `src/main.tsx` |
| **라우트** | `/` (홈), `/topics` (주제), `/stats` (통계), `/session` (집중 모드) |
| **DB** | SQLite (`bmad_test.db`), 3 테이블, forward-only 마이그레이션 |
| **상태 관리** | Zustand (세션), React hooks (기능별) |
| **스타일링** | CSS Modules + CSS Variables (디자인 토큰) |
| **테스트** | 18개 테스트 파일 (ESM, `.mjs`) |

## 생성된 문서

- [프로젝트 개요](./project-overview.md) — 목적, 기술 스택, 기능 요약
- [소스 트리 분석](./source-tree-analysis.md) — 전체 디렉터리 구조, 핵심 폴더, 진입점
- [아키텍처](./architecture.md) — 레이어드 아키텍처, 상태 관리, 런타임, 세션 FSM, 디자인 시스템
- [데이터 모델](./data-models.md) — ER 다이어그램, 테이블 스키마, 인덱스, FK, 마이그레이션
- [컴포넌트 인벤토리](./component-inventory.md) — 27개 UI 컴포넌트, 서비스, 훅, 디자인 요소
- [개발 가이드](./development-guide.md) — 환경 설정, 빌드, 테스트, 코딩 규칙, QA 모드

## 기존 프로젝트 문서

- [README](../README.md) — 프로젝트 기본 정보

## BMAD 산출물 (별도 관리)

- [PRD](../_bmad-output/planning-artifacts/prd.md) — 제품 요구사항 문서
- [UX 설계](../_bmad-output/planning-artifacts/ux-design-specification.md) — UX 디자인 명세
- [아키텍처 (BMAD)](../_bmad-output/planning-artifacts/architecture.md) — BMAD 아키텍처 결정
- [에픽](../_bmad-output/planning-artifacts/epics.md) — 에픽 및 스토리 목록
- [스프린트 상태](../_bmad-output/implementation-artifacts/sprint-status.yaml) — 스프린트 진행 상태

## 시작하기

### 로컬 개발 (Tauri 데스크톱)

```bash
npm install
npm run tauri dev
```

### 프론트엔드만 (브라우저 QA)

```bash
npm run dev
# → http://localhost:1420
```

### 테스트

```bash
node tests/session-flow.test.mjs
node tests/statistics-service.test.mjs
```

## AI 지원 개발 안내

이 문서를 AI에게 제공하여 효과적인 코드 수정을 유도할 수 있다:

1. **새 기능 추가**: `architecture.md` + `component-inventory.md` 참조하여 기존 패턴 따르기
2. **DB 변경**: `data-models.md` 참조하여 마이그레이션 작성
3. **UI 수정**: `component-inventory.md`에서 대상 컴포넌트 확인
4. **테스트 작성**: `development-guide.md`의 테스트 규칙 참조
5. **brownfield PRD**: 이 인덱스를 PRD 워크플로우에 입력으로 제공
