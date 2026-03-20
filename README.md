# 📚 bmad_test — 학습 집중 타이머

> 주제별 포모도로 세션 · 주간 목표 추적 · 학습 통계 분석

**bmad_test**는 자기주도 학습자를 위한 macOS 데스크톱 앱입니다.
단순 타이머가 아닌, **주간 목표 달성을 중심으로 꾸준한 학습을 설계**합니다.

<!-- 데모 영상이 준비되면 아래 주석을 해제하세요 -->
<!-- ![앱 데모 영상](./docs/assets/demo.mp4) -->

---

## 목차

- [주요 기능](#주요-기능)
- [스크린샷](#스크린샷)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [개발 명령어](#개발-명령어)
- [프로젝트 구조](#프로젝트-구조)
- [테스트](#테스트)
- [브라우저 QA 모드](#브라우저-qa-모드)
- [문서](#문서)
- [라이선스](#라이선스)

---

## 주요 기능

### 🎯 포모도로 세션

학습 주제를 선택하고 집중 모드에서 포모도로 타이머를 실행합니다. 완료된 세션은 자동으로 기록됩니다.

### 📋 주제 관리

학습 주제를 생성 · 수정 · 아카이브합니다. 주제별로 세션과 통계가 분류됩니다.

### 📊 주간 목표 & 통계

주제별 주간 학습 목표 시간을 설정하고, 오늘/주간 누적 시간과 목표 달성률을 한눈에 확인합니다.

### 🏠 대시보드

오늘의 학습 현황, 주간 진행 상황, 남은 목표를 요약 카드로 보여줍니다.

### ✏️ 기록 정정

세션의 주제를 잘못 선택한 경우 사후에 수정할 수 있으며, 통계가 자동으로 재계산됩니다.

---

## 스크린샷

> 🚧 **준비 중** — 스크린샷과 데모 영상이 추가될 예정입니다.

<!-- 스크린샷이 준비되면 아래 형식으로 추가하세요:
![홈 대시보드](./docs/assets/screenshot-home.png)
![포모도로 세션](./docs/assets/screenshot-session.png)
![통계 화면](./docs/assets/screenshot-stats.png)
-->

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 네이티브 셸 | [Tauri](https://v2.tauri.app/) | 2.x |
| 프론트엔드 | [React](https://react.dev/) | 19.1 |
| 언어 | [TypeScript](https://www.typescriptlang.org/) | 5.8 |
| 번들러 | [Vite](https://vite.dev/) | 7.x |
| 라우팅 | [React Router](https://reactrouter.com/) | 7.x |
| 상태 관리 | [Zustand](https://zustand.docs.pmnd.rs/) | 5.x |
| 검증 | [Zod](https://zod.dev/) | 4.x |
| 데이터베이스 | SQLite (embedded) | — |
| 스타일링 | CSS Modules + CSS Variables | — |

---

## 시작하기

### 사전 요구사항

| 도구 | 최소 버전 | 설치 확인 |
|------|----------|----------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Rust | stable | `rustc --version` |
| Xcode CLT (macOS) | — | `xcode-select --install` |

### 설치 및 실행

```bash
# 저장소 클론
git clone <repo-url> timerApp
cd timerApp

# 의존성 설치
npm install

# Tauri 데스크톱 앱 실행
npm run tauri dev
```

> 프론트엔드만 브라우저에서 확인하려면 `npm run dev`를 실행하세요. → [브라우저 QA 모드](#브라우저-qa-모드) 참고

---

## 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite 개발 서버 (포트 1420, 브라우저 QA 모드) |
| `npm run tauri dev` | Tauri 데스크톱 앱 실행 |
| `npm run build` | TypeScript 컴파일 + Vite 프로덕션 빌드 |
| `npm run tauri build` | macOS 앱 번들 (.app) 빌드 |
| `npm run preview` | 빌드 결과 로컬 프리뷰 |

---

## 프로젝트 구조

```
timerApp/
├── src/                  # React 프론트엔드
│   ├── app/              # 라우터, 레이아웃, 라우트 페이지
│   ├── domain/           # 도메인 모델, 스키마, 리포지토리
│   ├── features/         # 기능별 컴포넌트 · 서비스 · 훅
│   │   ├── dashboard/    #   대시보드 요약 카드
│   │   ├── goals/        #   주간 목표 관리
│   │   ├── records/      #   기록 정정
│   │   ├── session/      #   포모도로 세션
│   │   ├── stats/        #   학습 통계
│   │   └── topics/       #   주제 관리
│   ├── platform/         # Tauri / 브라우저 어댑터
│   ├── shared/           # 공통 유틸, UI, 디자인 토큰
│   └── db/               # DB 부트스트랩, 마이그레이션
├── src-tauri/            # Rust 기반 Tauri 셸
├── tests/                # 단위 · 통합 테스트 (.mjs)
└── docs/                 # 프로젝트 문서
```

**아키텍처**: Feature/Domain 기반 레이어드 아키텍처

```
App → Feature → Domain → Platform/Shared → DB
```

각 계층은 단방향 의존성을 따르며, 모든 비동기 함수는 `Result<T>` 패턴을 사용합니다 (`throw` 금지).

---

## 테스트

```bash
# 개별 테스트 실행
node --experimental-vm-modules tests/session-flow.test.mjs
node --experimental-vm-modules tests/statistics-service.test.mjs
node --experimental-vm-modules tests/record-correction.test.mjs
```

| 테스트 파일 | 대상 |
|------------|------|
| `session-flow.test.mjs` | 세션 생성 · 완료 · 중단 플로우 |
| `statistics-*.test.mjs` | 통계 서비스 · 리포지토리 · 매퍼 |
| `dashboard-service.test.mjs` | 대시보드 데이터 집계 |
| `weekly-goal-*.test.mjs` | 주간 목표 스키마 · 리포지토리 |
| `record-correction.test.mjs` | 기록 정정 |
| `stats-recomputation.test.mjs` | 수정 후 통계 재계산 |

---

## 브라우저 QA 모드

`npm run dev`로 브라우저에서 앱을 열면 인메모리 어댑터가 자동으로 활성화됩니다.
SQLite 없이 핵심 사용자 흐름(주제 선택 → 세션 시작 → 완료 → 통계 확인)을 검증할 수 있습니다.

> 브라우저 QA 모드는 DEV 환경에서만 활성화됩니다.

---

## 문서

상세 문서는 `docs/` 디렉터리에서 확인할 수 있습니다.

| 문서 | 설명 |
|------|------|
| [프로젝트 개요](./docs/project-overview.md) | 기술 스택, 기능 영역, 아키텍처 요약 |
| [아키텍처](./docs/architecture.md) | 계층 구조, 데이터 흐름, 상태 관리 상세 |
| [개발 가이드](./docs/development-guide.md) | 환경 설정, 코딩 규칙, 빌드, 테스트 |
| [데이터 모델](./docs/data-models.md) | DB 스키마, 테이블 관계 |
| [컴포넌트 인벤토리](./docs/component-inventory.md) | UI 컴포넌트 목록과 분류 |
| [소스 트리 분석](./docs/source-tree-analysis.md) | 전체 디렉터리 구조 |

---

## 데모

> 🎬 **데모 영상 준비 중** — 작동 영상이 추가될 예정입니다.

<!-- 데모 영상이 준비되면 아래 주석을 해제하고 경로를 업데이트하세요:

### 주제 생성 및 포모도로 세션
![주제 선택 후 세션 실행](./docs/assets/demo-session.gif)

### 주간 목표 설정 및 통계 확인
![주간 목표와 통계](./docs/assets/demo-stats.gif)

### 기록 정정
![기록 주제 수정](./docs/assets/demo-correction.gif)
-->

---

## 라이선스

이 프로젝트는 비공개(private) 프로젝트입니다.
