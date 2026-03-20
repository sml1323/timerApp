# 개발 가이드

> 생성일: 2026-03-20 | 프로젝트: bmad_test (Tauri 2 Desktop App)

## 사전 요구사항

| 도구 | 최소 버전 | 설치 확인 |
|------|----------|----------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Rust | stable | `rustc --version` |
| Tauri CLI | 2.x | `npx tauri --version` |
| Xcode CLT (macOS) | — | `xcode-select --install` |

## 설치

```bash
# 1. 저장소 클론
git clone <repo-url> timerApp
cd timerApp

# 2. npm 의존성 설치
npm install

# 3. Tauri 개발 서버 실행 (macOS 앱)
npm run tauri dev

# 4. 또는 프론트엔드만 (브라우저 QA 모드)
npm run dev
```

## 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite 개발 서버 (포트 1420, 브라우저 QA 모드) |
| `npm run tauri dev` | Tauri 데스크톱 앱 (Vite + Rust 동시 실행) |
| `npm run build` | TypeScript 컴파일 + Vite 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 로컬 프리뷰 |
| `npm run tauri` | Tauri CLI 직접 실행 |

## 환경 설정

### Vite (`vite.config.ts`)
- 포트: `1420` (고정, Tauri 연동)
- HMR: `ws://localhost:1421` (Tauri remote dev)
- `src-tauri/` 디렉터리 감시 제외

### TypeScript (`tsconfig.json`)
- Target: `ES2020`
- Strict mode: `true`
- `noUnusedLocals`, `noUnusedParameters` 활성화
- JSX: `react-jsx`

### Tauri (`src-tauri/tauri.conf.json`)
- 앱 이름: `tauri-app`
- 윈도우 크기: 800×600
- SQLite 플러그인: `sqlite:bmad_test.db` preload
- CSP: `null` (MVP)

## 프로젝트 구조 규칙

### 파일 생성 위치

| 유형 | 경로 |
|------|------|
| 도메인 타입 | `src/domain/{도메인명}/{entity}.ts` |
| Zod 스키마 | `src/domain/{도메인명}/{entity}-schema.ts` |
| 리포지토리 | `src/domain/{도메인명}/{entity}-repository.ts` |
| DB↔TS 매퍼 | `src/domain/{도메인명}/{entity}-mappers.ts` |
| 기능 서비스 | `src/features/{기능명}/{feature}-service.ts` |
| 커스텀 훅 | `src/features/{기능명}/hooks/use{Feature}.ts` |
| UI 컴포넌트 | `src/features/{기능명}/components/{Component}.tsx` |
| CSS Module | `src/features/{기능명}/components/{Component}.module.css` |
| 라우트 | `src/app/routes/{Name}Route.tsx` |
| 공용 UI | `src/shared/ui/{Component}/{Component}.tsx` |
| 유틸 | `src/shared/lib/{util}.ts` |
| SQL 마이그레이션 | `src/db/migrations/{NNN}_{description}.sql` |

### 코딩 규칙

1. **비동기 함수 반환**: 항상 `Result<T>` 사용 (`throw` 금지)
2. **입력 검증**: Zod 스키마 사용 (비동기 경계 시작점에서)
3. **DB 매핑**: `snake_case` ↔ `camelCase` 변환은 `*-mappers.ts`에서만
4. **import 경로**: 상대 경로 사용 (path alias 미설정)
5. **CSS**: CSS Modules + `cn()` 유틸 사용
6. **상태**: 로컬 → `useState`, 글로벌 → Zustand (세션 상태만)
7. **타이머**: `Date.now()` 기반 timestamp 사용 (incrementing counter 금지)

## 빌드

```bash
# TypeScript 컴파일 + Vite 빌드
npm run build

# Tauri 프로덕션 빌드 (macOS 앱 번들)
npm run tauri build
```

## 테스트

```bash
# 단위 테스트 실행
node --experimental-vm-modules tests/{test-file}.test.mjs

# 특정 테스트
node tests/session-flow.test.mjs
node tests/statistics-service.test.mjs
node tests/record-correction.test.mjs
node tests/stats-recomputation.test.mjs
```

### 테스트 파일 구조

| 파일 | 대상 |
|------|------|
| `session-flow.test.mjs` | 세션 생성/완료/중단 플로우 |
| `session-store.test.mjs` | Zustand 세션 store |
| `statistics-*.test.mjs` | 통계 서비스/리포지토리/매퍼 |
| `dashboard-service.test.mjs` | 대시보드 집계 |
| `weekly-goal-*.test.mjs` | 주간 목표 스키마/리포지토리/매퍼 |
| `goal-*.test.mjs` | 목표 진행률/서비스 |
| `record-correction.test.mjs` | 기록 정정 |
| `stats-recomputation.test.mjs` | 기록 수정 후 통계 재계산 |
| `dates.test.mjs` | 날짜 유틸 |

### 테스트 인프라

| 파일 | 역할 |
|------|------|
| `test-ipc.mjs` | Tauri IPC Mock |
| `test-load.mjs` | 모듈 로딩 헬퍼 |
| `test-mock.mjs` | 범용 Mock 헬퍼 |

## DB 마이그레이션 추가

```bash
# 1. 새 마이그레이션 파일 생성
touch src/db/migrations/004_description.sql

# 2. SQL 작성 (forward-only)
# 3. 앱 재시작 시 tauri-plugin-sql이 자동 실행
```

## 브라우저 QA 모드

`npm run dev`로 브라우저에서 앱을 열면:
1. `isTauriRuntime()` → false → 브라우저 QA 경로
2. `initializeBrowserQaRuntime()` 실행
3. 인메모리 어댑터로 모든 도메인 로직 재현
4. 핵심 흐름 검증: 주제 선택 → 세션 시작 → 완료 → 통계 확인

> 브라우저 QA 모드는 DEV 환경에서만 활성화된다. production 브라우저 접근 시 에러 발생.

## 관련 문서

- [아키텍처](./architecture.md) — 기술 아키텍처 상세
- [데이터 모델](./data-models.md) — DB 스키마, 테이블 관계
- [컴포넌트 인벤토리](./component-inventory.md) — UI 컴포넌트 목록
- [소스 트리 분석](./source-tree-analysis.md) — 전체 디렉터리 구조
