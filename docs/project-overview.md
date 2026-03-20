# bmad_test — 프로젝트 개요

> 생성일: 2026-03-20 | 스캔 레벨: exhaustive | 워크플로우: initial_scan

## 요약

**bmad_test**는 포모도로 기법 기반의 학습 타이머 데스크톱 앱이다. 사용자는 학습 주제를 생성·관리하고, 포모도로 세션을 실행하며, 주간 목표를 설정하여 학습 진척을 추적할 수 있다. 기록 정정 기능을 통해 데이터 신뢰성도 보장한다.

## 기술 스택

| 분류 | 기술 | 버전 | 비고 |
|------|------|------|------|
| 런타임 | Tauri | 2.x | Rust 기반 데스크톱 셸 |
| 프론트엔드 프레임워크 | React | 19.1 | Strict Mode 사용 |
| 언어 | TypeScript | 5.8 | strict 모드 |
| 번들러 | Vite | 7.x | Tauri dev/build 연동 |
| 라우팅 | React Router | 7.x | createBrowserRouter |
| 상태 관리 | Zustand | 5.x | 세션 상태 전용 store |
| 검증 | Zod | 4.x | 비동기 경계 입력 검증 |
| 데이터베이스 | SQLite | embedded | tauri-plugin-sql |
| 스타일링 | CSS Modules + CSS Variables | — | utility-first 프레임워크 미사용 |
| 알림 | tauri-plugin-notification | 2.x | 선택적 보조 기능 |

## 아키텍처 유형

- **Repository Type:** Monolith (단일 코드베이스)
- **Project Type:** Desktop (Tauri 2)
- **아키텍처 패턴:** Feature/Domain 기반 레이어드 아키텍처
- **데이터 아키텍처:** Embedded SQLite, 단일 사실원천(Single Source of Truth)

## 주요 기능 영역

| 기능 | 설명 |
|------|------|
| 주제 관리 | 학습 주제 CRUD, 아카이브 |
| 포모도로 세션 | 학습/휴식 타이머, 집중 모드, 자동 기록 |
| 주간 목표 | 주제별 주간 학습 목표 설정·추적 |
| 대시보드 | 오늘/주간 진행 상황 요약 카드 |
| 통계 | 주제별 누적 학습 시간, 오늘/주간 요약 |
| 기록 정정 | 세션 주제 재할당, 통계 자동 재계산 |

## 디렉터리 구조 요약

```
timerApp/
├── src/              # React 프론트엔드 소스
│   ├── app/          # 라우터, 레이아웃, 라우트 페이지
│   ├── domain/       # 도메인 모델, 리포지토리, 스키마
│   ├── features/     # 기능별 컴포넌트, 서비스, 훅
│   ├── platform/     # Tauri/브라우저 어댑터
│   ├── shared/       # 공통 유틸, UI, 스타일
│   └── db/           # DB 부트스트랩, 마이그레이션, 스키마
├── src-tauri/        # Rust 기반 Tauri 셸
├── tests/            # 단위/통합 테스트 (mjs)
└── _bmad-output/     # BMAD 계획/구현 산출물
```

## 생성된 문서

- [프로젝트 개요](./project-overview.md) — 본 문서
- [소스 트리 분석](./source-tree-analysis.md) — 전체 디렉터리 구조와 핵심 폴더 설명
- [아키텍처](./architecture.md) — 기술 아키텍처 상세
- [데이터 모델](./data-models.md) — DB 스키마, 테이블 관계
- [컴포넌트 인벤토리](./component-inventory.md) — UI 컴포넌트 목록과 분류
- [개발 가이드](./development-guide.md) — 환경 설정, 빌드, 테스트
- [마스터 인덱스](./index.md) — AI 검색용 주 진입점
