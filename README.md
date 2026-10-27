# 밍기적 챌린지

하루 1개, 부담 없는 미션을 무작위로 뽑아 해내고 그 기록이 그림일기처럼 쌓이는 모바일 우선 웹앱입니다.
완료 인증은 사진 없이 자기신고(체크)만 하고, 완료하면 도장이 쾅 찍힙니다.
이름은 '내가 일으킬 수 있는 아주 작은 기적, 밍기적'이라는 인터넷 밈에서 따왔습니다.

## 주요 기능

- **오늘의 미션 뽑기**: 카드를 눌러(모바일은 좌우로 넘겨도) 미션 200개 중 하나를 뽑습니다. 마음에 안 들면 하루 3번까지 다시 뽑을 수 있습니다.
- **완료와 도장**: '완료했어요!'를 누르면 도장 6종 중 하나가 위에서 내려와 찍힙니다. 완료 취소와 실패 기록은 없습니다.
- **연속 달성과 기록**: 연속 일수와 누적 개수, 완료한 날마다 도장이 찍힌 월간 달력을 보여줍니다. 날짜를 누르면 그날의 미션과 완료 시각을 볼 수 있습니다.
- **공휴일 표시**: 달력에 국경일·공휴일 이름을 표시합니다(한국천문연구원 특일 정보 API).
- **가입 없이 시작**: 처음 열면 익명 계정으로 바로 시작합니다. 이메일 계정 로그인(`/login`)도 있습니다.
- **크레파스 손그림 디자인**: 테두리와 구분선은 SVG 필터로 그린 손그림 선이고, 동작 줄이기 설정을 켜면 움직임 대신 페이드만 씁니다.

## 화면

| 경로 | 내용 |
| --- | --- |
| `/` | 홈. 오늘 상태에 따라 뽑기 전 → 도전중 → 완료 → 연속 달성 화면으로 바뀝니다 |
| `/records` | 기록. 월간 도장 달력, 누적·연속 칩, 날짜별 상세. `?month=YYYY-MM`으로 지난달을 봅니다 |
| `/login` | 이메일 계정 로그인 |

모바일은 하단 탭, 데스크톱(1024px 이상)은 상단 헤더와 2단 배치입니다.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router), React 19, TypeScript
- **스타일**: Tailwind CSS v4 (디자인 토큰은 `app/globals.css`의 `@theme`)
- **백엔드**: Supabase (Postgres, 익명 로그인, RLS), `@supabase/ssr`
- **애니메이션**: Motion (카드 스와이프, 도장 연출)
- **날짜**: date-fns, `@date-fns/tz` (하루 기준은 Asia/Seoul)
- **폰트**: Gaegu, Noto Sans KR (`next/font/google`)

### 데이터 흐름

화면은 Route Handler(`app/api/.../route.ts`)를 부르고, Route Handler는 `supabase.rpc()`로 Postgres 함수를 호출합니다.
테이블에는 쓰기 정책이 없어 모든 쓰기는 `security definer` 함수가 맡고, service role 키는 쓰지 않습니다.
뽑기 규칙(최근 완료·넘긴 미션 제외 등)과 날짜 판단도 서버(DB 함수)에서만 처리합니다.

| API | 설명 |
| --- | --- |
| `GET /api/today` | 오늘 상태(뽑기 전·도전중·완료, 미션, 남은 재뽑기, 연속·누적, 최근 기록) |
| `POST /api/today/draw` | 오늘의 카드 뽑기 |
| `POST /api/today/reroll` | 다시 뽑기(하루 3번) |
| `POST /api/today/complete` | 완료하고 도장 찍기 |
| `GET /api/records?month=YYYY-MM` | 그 달의 완료 기록 |

## 시작하기

### 필요한 것

- Node.js 24 (LTS). `package.json`의 `engines`에 `24.x`로 지정되어 있고, Vercel도 이 값으로 Node 버전을 고릅니다
- pnpm 11 (`packageManager`에 지정되어 있어 Corepack으로 맞출 수 있습니다)
- Supabase 프로젝트
- (선택) 공공데이터포털 [한국천문연구원 특일 정보](https://www.data.go.kr/) 인증키. 없으면 달력에 공휴일만 빠집니다

### 1. 설치

```bash
pnpm install
```

### 2. Supabase 준비

1. Supabase에서 프로젝트를 만들고 **Authentication → Sign In / Providers**에서 익명 로그인(Anonymous sign-ins)을 켭니다.
2. **SQL Editor**에서 아래 두 파일을 차례로 실행합니다.
   - [`supabase/migrations/20261016000000_init.sql`](supabase/migrations/20261016000000_init.sql): 테이블, RLS, 함수
   - [`supabase/seed.sql`](supabase/seed.sql): 미션 200개(다시 실행해도 덮어씁니다)

### 3. 환경변수

[`.env.example`](.env.example)을 `.env`로 복사하고 값을 채웁니다.

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_KEY` | Supabase publishable 키. 브라우저에서 익명 로그인을 하므로 공개되는 키입니다 |
| `HOLIDAY_API_KEY` | 특일 정보 API 인증키(서버 전용) |
| `CRON_SECRET` | (배포용) Vercel Cron이 `/api/cron/keep-alive`를 부를 때 쓰는 비밀 값 |

### 4. 실행

```bash
pnpm dev     # 개발 서버 (http://localhost:3000)
pnpm build   # 프로덕션 빌드
pnpm start   # 빌드 결과 실행
pnpm lint    # ESLint
pnpm gen:types  # DB 구조가 바뀌면 types/database.ts 다시 생성(Supabase CLI 로그인 필요)
```

### 무료 Supabase 일시 중지 막기

Supabase 무료 프로젝트는 7일 동안 요청이 없으면 일시 중지됩니다.
[`vercel.json`](vercel.json)의 Vercel Cron이 매일 03:00(한국 시간)에 `/api/cron/keep-alive`를 불러 미션 한 줄을 읽어 둡니다.
Vercel 환경변수에 `CRON_SECRET`(임의의 긴 문자열)을 넣어 두면, 그 값을 가진 요청만 처리합니다.

## 폴더 구조

```text
app/                 라우팅 파일만 둔다 (page, layout, route, loading, error, not-found)
  api/               Route Handler 5개
components/
  ui/                손그림 테두리, 버튼, 칩·배지, 스켈레톤, 상태 카드 등 공통 요소
  stamp/             도장 6종 컴포넌트
  home/              홈 전용(카드 더미·미션 카드, 스와이프, 완료 연출, 연속 달성)
  records/           기록 전용(월간 달력, 날짜 상세)
  nav/               모바일 하단 탭, 데스크톱 헤더
  auth/              익명 세션, 로그인, 계정 메뉴
lib/                 Supabase 클라이언트, API 호출 도우미, 날짜·공휴일
types/               API 응답 타입(api.ts), Supabase DB 타입(database.ts, 자동 생성)
supabase/            DB 스키마(migrations)와 미션 시드
public/images/       마스코트, 도장 원본, 낙서 장식, 도화지 텍스처
```

## 설계 문서

- [기획서](.claude/밍기적-챌린지-기획서.md): 기능, 화면 흐름, 디자인 기준값, 미션 데이터
- [서버 설계](.claude/밍기적-챌린지-서버설계.md): API 명세, DB 스키마와 함수
- [화면 설계](<.claude/밍기적 챌린지 화면 설계.pdf>): 모바일·데스크톱 보드, 도장, 공통 상태 화면

## 라이선스

[MIT](LICENSE)
