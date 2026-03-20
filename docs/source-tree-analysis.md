# 소스 트리 분석

> 생성일: 2026-03-20 | 스캔 레벨: exhaustive

## 전체 디렉터리 트리

```
timerApp/
├── index.html                          # Vite 진입점 HTML
├── package.json                        # npm 패키지 매니페스트
├── vite.config.ts                      # Vite 빌드 설정 (Tauri 연동)
├── tsconfig.json                       # TypeScript 컴파일러 설정 (strict)
├── tsconfig.node.json                  # Node용 TS 설정
├── tsconfig.tests.json                 # 테스트용 TS 설정
├── default.svg                         # 캐릭터 SVG (홈/대기)
├── loading.svg                         # 캐릭터 SVG (세션 진행 중)
├── speak.svg                           # 캐릭터 SVG (완료/피드백)
│
├── src/                                # ★ 프론트엔드 소스 루트
│   ├── main.tsx                        # ★ 앱 진입점 (런타임 분기 + 초기화)
│   ├── vite-env.d.ts                   # Vite 타입 선언
│   │
│   ├── app/                            # 앱 셸, 라우팅, 레이아웃
│   │   ├── router.tsx                  # ★ React Router 설정 (/, /topics, /stats, /session)
│   │   ├── layout/
│   │   │   ├── AppShell.tsx            # 메인 내비게이션 레이아웃
│   │   │   ├── AppShell.module.css
│   │   │   ├── FocusLayout.tsx         # 세션 집중 모드 레이아웃
│   │   │   ├── FocusLayout.module.css
│   │   │   ├── MainNavigation.tsx      # 하단/사이드 내비게이션 바
│   │   │   ├── MainNavigation.module.css
│   │   │   └── index.ts               # barrel export
│   │   ├── routes/
│   │   │   ├── HomeRoute.tsx           # 홈 대시보드 (/)
│   │   │   ├── HomeRoute.module.css
│   │   │   ├── TopicsRoute.tsx         # 주제 관리 (/topics)
│   │   │   ├── StatsRoute.tsx          # 통계 화면 (/stats)
│   │   │   ├── StatsRoute.module.css
│   │   │   └── NotFoundRoute.tsx       # 404 페이지
│   │   └── providers/                  # Context Providers (현재 비어있음)
│   │
│   ├── domain/                         # ★ 도메인 계층 (순수 비즈니스 로직)
│   │   ├── topics/
│   │   │   ├── topic.ts                # Topic 타입 정의
│   │   │   ├── topic-schema.ts         # Zod 검증 스키마
│   │   │   ├── topic-repository.ts     # CRUD (create, findAll, findById, update, archive)
│   │   │   └── topic-mappers.ts        # DB row ↔ TS 객체 변환
│   │   ├── sessions/
│   │   │   ├── session.ts              # Session 타입 + 입력 인터페이스
│   │   │   ├── session-schema.ts       # Zod 검증 스키마
│   │   │   ├── session-repository.ts   # CRUD + reassignSessionTopic
│   │   │   ├── session-mappers.ts      # DB row ↔ TS 객체 변환
│   │   │   ├── session-transitions.ts  # 상태 전이 규칙 (planned→running→completed/interrupted)
│   │   │   └── session-statistics.ts   # 주간 주제별 학습 분 집계
│   │   ├── statistics/
│   │   │   ├── statistics.ts           # 통계 타입 (Today/Weekly/ByTopic)
│   │   │   ├── statistics-repository.ts # SQL 집계 쿼리
│   │   │   └── statistics-mappers.ts   # DB row → TS 변환
│   │   └── goals/
│   │       ├── weekly-goal.ts          # WeeklyGoal 타입 정의
│   │       ├── weekly-goal-schema.ts   # Zod 검증 스키마
│   │       ├── weekly-goal-repository.ts # CRUD (create, update, findByTopicAndWeek, findAllByWeek)
│   │       └── weekly-goal-mappers.ts  # DB row ↔ TS 객체 변환
│   │
│   ├── features/                       # ★ 기능별 UI + 서비스 + 훅
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── StudyStatusSummaryCard.tsx  # 홈 화면 요약 카드
│   │   │   │   └── StudyStatusSummaryCard.module.css
│   │   │   ├── dashboard-service.ts    # 대시보드 데이터 집계 서비스
│   │   │   └── hooks/
│   │   │       └── useDashboardData.ts # 대시보드 데이터 훅
│   │   ├── goals/
│   │   │   ├── components/
│   │   │   │   ├── GoalProgressInline.tsx      # 목표 진행률 인라인 표시
│   │   │   │   ├── GoalProgressInline.module.css
│   │   │   │   ├── GoalSettingsDialog.tsx      # 목표 설정 다이얼로그
│   │   │   │   └── GoalSettingsDialog.module.css
│   │   │   ├── goal-service.ts         # 목표 서비스 로직
│   │   │   └── hooks/
│   │   │       ├── useGoalProgress.ts  # 목표 진행률 훅
│   │   │       └── useWeeklyGoals.ts   # 주간 목표 CRUD 훅
│   │   ├── records/
│   │   │   ├── components/
│   │   │   │   ├── RecordList.tsx              # 세션 기록 목록
│   │   │   │   ├── RecordList.module.css
│   │   │   │   ├── RecordCorrectionDialog.tsx  # 기록 수정 다이얼로그
│   │   │   │   ├── RecordCorrectionDialog.module.css
│   │   │   │   ├── CorrectionFeedback.tsx      # 수정 완료 피드백
│   │   │   │   └── CorrectionFeedback.module.css
│   │   │   ├── record-correction-service.ts    # 기록 정정 서비스
│   │   │   └── hooks/
│   │   │       └── useRecordCorrection.ts      # 기록 정정 훅
│   │   ├── session/
│   │   │   ├── SessionPage.tsx         # 세션 페이지 (집중 모드)
│   │   │   ├── SessionPage.module.css
│   │   │   ├── components/
│   │   │   │   ├── TopicQuickSelectPanel.tsx    # 주제 빠른 선택 패널
│   │   │   │   ├── TopicQuickSelectPanel.module.css
│   │   │   │   ├── SessionFocusTimer.tsx       # 포모도로 타이머
│   │   │   │   ├── SessionFocusTimer.module.css
│   │   │   │   ├── SessionOutcomePanel.tsx     # 세션 결과 패널
│   │   │   │   ├── SessionOutcomePanel.module.css
│   │   │   │   ├── CharacterStatePanel.tsx     # 캐릭터 상태 패널
│   │   │   │   └── CharacterStatePanel.module.css
│   │   │   ├── hooks/
│   │   │   │   ├── useSessionClock.ts  # 타이머 인터벌 훅
│   │   │   │   └── useTopicSelect.ts   # 주제 선택 훅
│   │   │   ├── session-flow.ts         # 세션 플로우 로직
│   │   │   ├── session-service.ts      # 세션 서비스 (생성/완료/중단)
│   │   │   └── state/
│   │   │       ├── sessionStore.ts     # Zustand 세션 상태 store
│   │   │       └── sessionSelectors.ts # 파생 셀렉터
│   │   ├── stats/
│   │   │   ├── components/
│   │   │   │   ├── StatsSummaryCard.tsx         # 통계 요약 카드
│   │   │   │   ├── StatsSummaryCard.module.css
│   │   │   │   ├── TopicBreakdownList.tsx       # 주제별 통계 목록
│   │   │   │   └── TopicBreakdownList.module.css
│   │   │   ├── statistics-service.ts   # 통계 서비스
│   │   │   └── hooks/
│   │   │       └── useStatistics.ts    # 통계 데이터 훅
│   │   └── topics/
│   │       ├── TopicsPage.tsx          # 주제 관리 페이지
│   │       ├── TopicsPage.module.css
│   │       ├── components/
│   │       │   ├── TopicCard.tsx        # 주제 카드
│   │       │   ├── TopicCard.module.css
│   │       │   ├── TopicForm.tsx        # 주제 생성/수정 폼
│   │       │   ├── TopicForm.module.css
│   │       │   ├── TopicList.tsx        # 주제 목록
│   │       │   └── TopicList.module.css
│   │       ├── hooks/
│   │       │   └── useTopics.ts         # 주제 CRUD 훅
│   │       └── topic-service.ts         # 주제 서비스
│   │
│   ├── platform/                       # ★ 플랫폼 추상화 계층
│   │   ├── tauri/
│   │   │   ├── sql-client.ts           # ★ SQLite DB 싱글턴 어댑터 (select, execute)
│   │   │   └── notification-client.ts  # macOS 알림 클라이언트
│   │   ├── browser/
│   │   │   ├── browser-qa-bootstrap.ts # 브라우저 QA 모드 초기화
│   │   │   ├── topic-adapter.ts        # 브라우저 주제 어댑터
│   │   │   ├── session-adapter.ts      # 브라우저 세션 어댑터
│   │   │   ├── goal-adapter.ts         # 브라우저 목표 어댑터
│   │   │   ├── statistics-adapter.ts   # 브라우저 통계 어댑터
│   │   │   ├── in-memory-topic-adapter.ts       # 인메모리 주제 구현
│   │   │   ├── in-memory-session-adapter.ts     # 인메모리 세션 구현
│   │   │   ├── in-memory-goal-adapter.ts        # 인메모리 목표 구현
│   │   │   └── in-memory-statistics-adapter.ts  # 인메모리 통계 구현
│   │   └── runtime/
│   │       └── runtime-detect.ts       # ★ Tauri/브라우저 런타임 감지
│   │
│   ├── shared/                         # 공통 유틸리티, 디자인 시스템
│   │   ├── lib/
│   │   │   ├── result.ts              # ★ 판별 결과 타입 (ok | err)
│   │   │   ├── errors.ts             # 에러 코드 상수
│   │   │   ├── dates.ts              # 날짜 유틸 (주 시작, 오늘 시작)
│   │   │   └── cn.ts                 # className 결합 유틸
│   │   ├── styles/
│   │   │   ├── tokens.css            # ★ 디자인 토큰 (색상, 타이포, 스페이싱)
│   │   │   ├── globals.css           # 전역 기본 스타일
│   │   │   └── utilities.css         # 유틸리티 CSS 클래스
│   │   ├── ui/
│   │   │   └── Button/
│   │   │       ├── Button.tsx         # 공용 버튼 컴포넌트 (Primary/Secondary/Text/Destructive)
│   │   │       ├── Button.module.css
│   │   │       └── index.ts
│   │   ├── hooks/                     # (현재 비어있음)
│   │   ├── constants/                 # (현재 비어있음)
│   │   └── types/                     # (현재 비어있음)
│   │
│   ├── db/                            # 데이터베이스 계층
│   │   ├── bootstrap/
│   │   │   └── initializeDatabase.ts  # ★ DB 연결 검증 (앱 시작)
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql # topics, weekly_goals, sessions 테이블
│   │   │   ├── 002_indexes.sql        # 성능 인덱스
│   │   │   └── 003_single_running_session_guard.sql # 단일 running 세션 보장
│   │   └── schema/
│   │       ├── topics.sql             # topics DDL 참조
│   │       ├── sessions.sql           # sessions DDL 참조
│   │       └── weekly_goals.sql       # weekly_goals DDL 참조
│   │
│   ├── assets/                        # 정적 에셋
│   │   └── characters/
│   │       ├── default.svg            # 홈/대기 캐릭터
│   │       ├── loading.svg            # 세션 진행 캐릭터
│   │       └── speak.svg             # 완료/피드백 캐릭터
│   │
│   └── test/                          # 테스트 헬퍼 (src 내부)
│
├── src-tauri/                         # ★ Tauri Rust 백엔드
│   ├── Cargo.toml                     # Rust 의존성
│   ├── Cargo.lock
│   ├── build.rs                       # 빌드 스크립트
│   ├── tauri.conf.json                # ★ Tauri 설정 (윈도우, 플러그인, 번들)
│   ├── capabilities/                  # Tauri 2 보안 capabilities
│   ├── src/                           # Rust 소스
│   └── icons/                         # 앱 아이콘 (icns, ico, png)
│
├── tests/                             # ★ 테스트 파일 (18개)
│   ├── dashboard-service.test.mjs
│   ├── session-flow.test.mjs
│   ├── session-store.test.mjs
│   ├── statistics-*.test.mjs          # 통계 관련 테스트
│   ├── weekly-goal-*.test.mjs         # 목표 관련 테스트
│   ├── record-correction.test.mjs
│   ├── stats-recomputation.test.mjs
│   └── test-*.mjs                     # 테스트 유틸 (ipc mock, load, mock)
│
├── public/                            # Vite public 에셋
├── dist/                              # 빌드 출력
└── _bmad-output/                      # BMAD 산출물
    ├── planning-artifacts/            # PRD, 아키텍처, UX 설계, 에픽
    └── implementation-artifacts/      # 스프린트 상태, 스토리 파일
```

## 핵심 폴더 요약

| 폴더 | 역할 | 주요 패턴 |
|------|------|----------|
| `src/domain/` | 비즈니스 로직, 데이터 모델 | 타입 → 스키마 → 리포지토리 → 매퍼 |
| `src/features/` | 기능별 UI, 서비스, 훅 | 컴포넌트 → CSS Module, 서비스 → 훅 |
| `src/platform/` | 런타임 추상화 | Tauri 실제 구현 ↔ 브라우저 인메모리 어댑터 |
| `src/shared/` | 공통 유틸, 디자인 시스템 | Result 패턴, 에러 코드, CSS 토큰 |
| `src/db/` | DB 초기화, 마이그레이션 | forward-only SQL 마이그레이션 |
| `src/app/` | 라우팅, 레이아웃 | AppShell ↔ FocusLayout 분리 |
| `src-tauri/` | Rust 네이티브 셸 | SQL 플러그인, 알림 플러그인 |
| `tests/` | 단위/통합 테스트 | ESM (mjs), 인메모리 어댑터 사용 |

## 진입점

| 진입점 | 파일 | 설명 |
|--------|------|------|
| 프론트엔드 | `src/main.tsx` | React 앱 부트스트랩, 런타임 분기 |
| 라우터 | `src/app/router.tsx` | 라우트 정의 (/, /topics, /stats, /session) |
| DB 초기화 | `src/db/bootstrap/initializeDatabase.ts` | SQLite 연결 검증 |
| Tauri 셸 | `src-tauri/src/main.rs` | Rust 엔트리 |
| HTML | `index.html` | Vite 진입 HTML |
