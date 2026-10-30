# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 명령어

패키지 매니저는 pnpm이다(`packageManager: pnpm@12.8.1`). 전역 pnpm이 이 버전으로 맞춰 실행하고, `pnpm-lock.yaml` 맨 앞 문서에 pnpm 자신의 버전이 함께 잠긴다.

```bash
pnpm dev      # 개발 서버 (http://localhost:3000)
pnpm build    # 프로덕션 빌드
pnpm start    # 빌드 결과 실행
pnpm lint     # ESLint (flat config, eslint-config-next core-web-vitals + typescript)
pnpm gen:types  # DB 구조가 바뀌면 types/database.ts 다시 생성(Supabase CLI 로그인 필요, pnpm dlx로 실행)
```

테스트 러너는 아직 설정되어 있지 않다.

## 현재 상태

디자인 기반, 홈(뽑기 → 도전중 → 완료 → 연속 달성), 기록, 서버(Supabase DB, API 6개)가 동작하고 Vercel에 배포했다(<https://micro-challenge-one.vercel.app/>). 로그인 흐름 개편(익명 + Google)을 2026-10-27에 `main`에 합쳐 배포했다: 시작 화면, Google 로그인·연결, 계정 메뉴, 설정, 처리방침·약관, 계정 삭제. 남은 것은 Google 앱 게시(지금은 '테스트 중'이라 등록한 테스트 사용자만 Google 로그인), 익명 계정 정리(180일) 실행, 기획서·서버 설계 갱신이고, 다음 기능은 기록 모아 보기다.

- 진행 상황과 남은 작업: [.claude/작업-현황.md](.claude/작업-현황.md)
- 로그인 흐름 개편 계획: [.claude/로그인-흐름-계획.md](.claude/로그인-흐름-계획.md)
- 추가 기능 계획(완료 메모, 미션 제안): [.claude/추가-기능-계획.md](.claude/추가-기능-계획.md)

아래 "제품"과 "설계 결정"의 출처는 다음 문서다. 코드와 문서가 다르면 문서를 먼저 확인한다(마스코트 포즈는 아래 예외).

로컬 사본을 먼저 읽는다(기획서·서버 설계는 2026-10-15, 화면 설계는 2026-10-22에 내보냄). 원본 Claude Docs 문서는 Claude Docs 커넥터 없이는 본문을 읽을 수 없다.

- 기획서(+ '미션 데이터' 탭): [.claude/밍기적-챌린지-기획서.md](.claude/밍기적-챌린지-기획서.md) · 원본 Claude 아티팩트
- 서버 설계(API 명세, SQL 초안): [.claude/밍기적-챌린지-서버설계.md](.claude/밍기적-챌린지-서버설계.md) · 원본 Claude 아티팩트
- 화면 설계(모바일·데스크톱 보드, 로그인: 익명 + Google 보드, 계정 메뉴·설정·처리방침·약관 보드, 기록 모아 보기, 도장 컴포넌트, 에셋): [.claude/밍기적 챌린지 화면 설계.pdf](<.claude/밍기적 챌린지 화면 설계.pdf>) · 원본 Claude 아티팩트 (보드별 `.dc.html` 소스와 이미지 에셋은 원본 캔버스의 `project/` 아래에 있다)

원본을 고치면 로컬 사본도 다시 내보낸다.

**마스코트 포즈는 코드가 기준이다.** 화면 설계의 기존 보드(홈, 기록, 공통 상태)에 그려진 마스코트는 지금 코드와 다르지만, 코드에 있는 포즈를 그대로 유지한다. 화면 설계에서 마스코트를 따르는 것은 로그인(익명 + Google)과 계정 메뉴·설정 보드뿐이다: 시작 화면 `stretching`, 연결 실패 `thinking`, 계정 삭제 확인 `sad`, 익명 로그아웃 확인은 책 든 티라노(기존 계정 로그인 확인 보드는 쓰지 않는다).

## 코드베이스 규칙

- Next.js 16 App Router + React 19 + TypeScript(strict). `src/` 디렉터리 없이 루트의 `app/`을 쓴다.
- 경로 별칭 `@/*`는 저장소 루트를 가리킨다.
- Tailwind CSS v4: `tailwind.config` 파일이 없다. 디자인 토큰은 `app/globals.css`의 `@theme`에 등록한다.
- `pnpm-workspace.yaml`의 `allowBuilds`가 `sharp`, `unrs-resolver`의 빌드 스크립트를 막고 있다.

## 폴더 구조

`app/`은 라우팅 파일(`page`, `layout`, `route` 등)만 두고, 나머지 코드는 루트의 공용 폴더에 둔다. 빈 폴더는 `.gitkeep`으로 유지하며, 첫 파일이 생기면 지운다.

```text
app/
  welcome/              /welcome 시작 화면(세션이 없을 때 익명 시작 또는 Google 계속)
  records/              /records
  settings/             /settings 계정·앱 설정(계정 카드, 앱 정보, 계정 삭제)
  privacy/, terms/      /privacy 개인정보처리방침, /terms 서비스 이용약관(세션 없이도 열림)
  auth/callback/        Google 로그인·연결이 돌아오는 곳(code → 세션, 실패하면 /welcome?error= 또는 하던 화면?auth_error=)
  api/today/            GET /api/today  (draw/, reroll/, complete/ 아래에 각 POST)
  api/records/          GET /api/records?month=YYYY-MM
  api/account/delete/   POST 계정 삭제(Google·익명 모두. 사용자와 기록·세션을 지운다)
  api/cron/keep-alive/  Supabase 무료 프로젝트 일시 중지 방지(vercel.json의 Cron, CRON_SECRET 확인)
components/
  ui/                   손그림 카드 테두리, 버튼, 칩·배지, 상태 카드, 오류 화면, 낙서 장식 등 공통 요소
  stamp/                도장 컴포넌트(p01–p12, mini)
  nav/                  모바일 하단 탭, 데스크톱 상단 헤더
  auth/                 시작 화면, 공식 Google 버튼, 계정 메뉴(데스크톱 헤더, 모바일 햄버거),
                        Google 연결(useLinkGoogle), 연결 실패 안내, 익명 로그아웃 확인
  settings/             설정 화면(계정 카드, 앱 정보 카드, 계정 삭제 확인)
  legal/                처리방침·약관 문안(documents.ts, 빈칸 상수는 맨 위)과 문서 틀
  home/                 홈 전용(카드 더미·스택, 스와이프, 완료 연출, 연속 달성, 최근 기록)
  records/              기록 전용(월간 캘린더, 날짜 상세)
lib/
  supabase/             @supabase/ssr 클라이언트(server.ts, client.ts, proxy.ts의 세션 갱신)
  api.ts                브라우저용 API 호출 도우미와 로그인 함수(익명 시작, Google 로그인·연결, 로그아웃,
                        401이면 쿠키를 지우고 /welcome)
  links.ts, safe-next.ts  바깥 주소(피드백 = GitHub Issues), 로그인 뒤 돌아갈 경로(next) 검사
  api-server.ts         Route Handler 공통 처리(세션 확인 → RPC), api-error.ts 에러 코드 → HTTP
  date.ts, today.ts     날짜 포맷·달력 칸 계산, 서버 첫 렌더링용 날짜(getToday)
  useDaySync.ts         자정 넘김 확인, 서버 날짜와 화면 날짜 맞추기
  holidays.ts           공휴일(한국천문연구원 특일 정보, HOLIDAY_API_KEY)
proxy.ts                세션 확인·갱신, 세션이 없으면 앱 화면 → /welcome, 세션이 있으면 /welcome → /
types/                  api.ts(API 응답 타입), database.ts(`pnpm gen:types`로 만든 DB 타입. 손으로 고치지 않는다)
supabase/
  migrations/           서버 설계의 SQL 초안 1~6(init), 계정 삭제 함수 delete_my_account. 시드(7)는 supabase/seed.sql
  tests/                뽑기 규칙 확인(draw-rules), 계정 삭제 확인(delete-account) SQL(SQL Editor에서 실행)
  test-users.sql        이메일 테스트 계정 3개와 기록(git 제외). /login을 지워 화면에서는 로그인할 수 없다
assets/fonts/           공유 이미지(opengraph-image)용 Gaegu Bold 서브셋. 문구를 바꾸면 다시 만든다
public/images/
  mascot/               티라노 마스코트 포즈 16종(투명 PNG, tyrano-*.png): basic(기본), challenge(도전 중),
                        did-it(해냈다), done(완료), excited(신남), favorite(쿠키), reading(책 읽기),
                        thinking(고민 중), hard(어려워), stretching(기지개), watering(물 주기),
                        spacing-out(멍), sleeping(자는 중), fail(실패), sad(슬픔), angry(화남)
  stamps/               도장 p01–p12 SVG(지름 190px, Gaegu 서브셋 내장). png/에 @2x·@4x. 디자인 원본이고
                        코드에서는 components/stamp를 쓴다(공유 이미지가 png/p01@4x.png를 쓰니 지우지 않는다)
  stamps/mini/          달력·최근 기록용 작은 도장 SVG(문구 없음). png/에 @2x
  decor/                낙서 장식(꽃, 하트, 음표, 반짝이, 별, 소용돌이, 테이프)
  lines/                구분선(크레용, 점선, 물결)
  paper-texture.png     도화지 텍스처(320px 타일)
```

앱 아이콘은 Next.js 파일 규칙에 따라 `app/icon.png`(512px)과 `app/apple-icon.png`(192px)에 둔다. 하단 탭 아이콘은 선택 상태에 따라 색(`currentColor`)을 바꿔야 해서 SVG 파일 대신 `components/nav/nav-items.tsx`에 인라인으로 둔다.

`/settings`는 계정·앱 설정 페이지로 만들었다(기획서의 4단계 `/settings`는 미션 제출이었다. 만들게 되면 설정 안에 둔다). 4단계 `/admin`용 폴더는 만들지 않았다.

## 제품: 밍기적 챌린지

하루 1개의 가벼운 미션을 랜덤으로 뽑아 자기신고로 완료하고, 도장이 그림일기식 달력에 쌓이는 모바일 우선 웹앱이다.

- 경로: `/welcome`(시작), `/`(홈), `/records`(기록), `/settings`(설정), `/privacy`·`/terms`(처리방침·약관). `/admin`(과 미션 제출)은 4단계(보류)로, 만들지 않을 수도 있다.
- 홈은 서버가 주는 `state`로 화면을 고른다: `not_drawn`(뽑기 전) → `challenge`(도전중) → `done`(연속 달성). 완료 직후에는 도장 연출을 거쳐 연속 달성으로 넘어간다.
- 재뽑기는 하루 3회(첫 카드 포함 최대 4장), 완료 취소 없음, 미완료는 기록하지 않음(실패 상태 없음).
- 모바일은 하단 탭 2개 + 카드 스와이프, 데스크톱은 상단 헤더 내비게이션 + 2단(최대 1040px) + 버튼으로만 재뽑기.

## 설계 결정

- **스택**: Supabase(Postgres, 익명 로그인, RLS) + `@supabase/ssr`, Motion(카드 드래그·도장 연출), date-fns + `@date-fns/tz`, `next/font/google`의 Gaegu·Noto Sans KR, Vercel 배포. 별도 상태 관리 라이브러리는 쓰지 않는다.
- **인증**: 익명 + Google([계획](.claude/로그인-흐름-계획.md)). 세션이 없으면 proxy가 `/welcome`으로 보내고, 거기서 "익명으로 시작하기"(이때만 익명 계정을 만든다) 또는 "Google 계정으로 계속"을 고른다. 익명 사용자는 "Google 계정 연결"(`linkIdentity`)로 같은 사용자 ID에 Google을 붙여 기록을 지킨다. 이미 가입된 Google 계정이면 연결 실패 안내를 띄우고, 익명 기록이 0개면 안내 없이 그 계정으로 로그인한다. Google로 가는 버튼은 모두 공식 Google 버튼(표준 색 G 로고)을 쓴다. 계정 삭제는 Google·익명 모두 Supabase 사용자와 기록을 지우고, Google 쪽 연결은 끊지 않고 Google 계정 설정 링크로 안내한다(기본안. 연결 해제는 나중에 넓힐 수 있다). 이메일 가입·로그인은 없다(개발용 `/login`도 2026-10-26에 지웠다).
- **쓰기 경로**: 클라이언트 → Route Handler(`app/api/.../route.ts`) → `supabase.rpc()` → security definer Postgres 함수. Server Action은 쓰지 않는다. 테이블에 쓰기 정책이 없어 모든 쓰기는 함수가 맡고, service role 키는 쓰지 않는다.
- **API 6개**: `GET /api/today`, `POST /api/today/draw`, `POST /api/today/reroll`, `POST /api/today/complete`, `GET /api/records?month=YYYY-MM`, `POST /api/account/delete`. 상태 변경 API는 모두 `/api/today`와 같은 모양(`date`, `state`, `mission`, `rerollsLeft`, `completedAt`, `stampId`, `streak`, `totalCompleted`, `recent`)을 돌려준다.
- **날짜**: 하루는 Asia/Seoul 기준이고 DB의 `kst_day()`(도착 시각 − 1분)만 믿는다. 화면은 날짜를 직접 계산하지 않고 `/api/today`가 준 `date`를 그대로 쓰며, 변경 요청에 그 `date`를 보낸다. 서버 날짜와 다르면 `DAY_CHANGED`(409)를 받고 오늘 상태를 다시 불러온다.
- **에러**: DB 함수가 코드를 예외 메시지로 던지고(`NO_REROLLS`, `ALREADY_DRAWN` 등) Route Handler가 HTTP 상태와 `{ "error": { "code", "message" } }`로 바꾼다.
- **뽑기 규칙**(서버에서만 처리): 180일 내 완료한 미션, 14일 내 넘긴 미션, 오늘 본 미션을 제외하고 균등 랜덤. 후보가 없으면 가장 오래전에 본 미션부터.
- **데이터**: `missions`(ID `E001–E180`, `C01–C20`, 삭제 대신 `is_active=false`), `daily_entries`(사용자·날짜당 1행).
- **도장**: 12종(`p01`–`p12`)을 서버가 정해 `stamp_id`에 저장한다. 그 사용자가 최근 완료한 4번의 도장은 빼고 남은 8개 중 무작위(`pick_stamp`)라 5번 안에는 같은 도장이 다시 나오지 않는다. 화면에서는 `variant`·`size`·`mini`를 받는 SVG 컴포넌트 하나로 그린다(mini는 문구 없이 틀과 그림만).
- **비주얼**: 크레파스 손그림 + 그림일기 톤. 테두리·구분선은 CSS 직선 대신 SVG 손그림 선(turbulence 필터). 다크 모드는 지원하지 않는다(초기 템플릿의 `prefers-color-scheme: dark` 블록은 제거 대상). `prefers-reduced-motion`이면 페이드만 쓴다. 색·폰트 기준값은 기획서 '디자인 기준값' 표를 따른다.
