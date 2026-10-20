# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 명령어

패키지 매니저는 pnpm이다(`packageManager: pnpm@11.8.0`).

```bash
pnpm dev      # 개발 서버 (http://localhost:3000)
pnpm build    # 프로덕션 빌드
pnpm start    # 빌드 결과 실행
pnpm lint     # ESLint (flat config, eslint-config-next core-web-vitals + typescript)
pnpm gen:types  # DB 구조가 바뀌면 types/database.ts 다시 생성(Supabase CLI 로그인 필요, pnpm dlx로 실행)
```

테스트 러너는 아직 설정되어 있지 않다.

## 현재 상태

create-next-app 초기 상태에 아래 "폴더 구조"의 빈 폴더만 잡아 둔 상태다(`app/layout.tsx`, `app/page.tsx`, `app/globals.css`만 있음). 아래 "제품"과 "설계 결정"은 아직 코드에 없는 목표 설계이며, 출처는 다음 문서다. 코드와 문서가 다르면 문서를 먼저 확인한다.

로컬 사본(2026-10-15에 내보냄)을 먼저 읽는다. 원본 Claude Docs 문서는 Claude Docs 커넥터 없이는 본문을 읽을 수 없다.

- 기획서(+ '미션 데이터' 탭): [.claude/밍기적-챌린지-기획서.md](.claude/밍기적-챌린지-기획서.md) · 원본 Claude 아티팩트
- 서버 설계(API 명세, SQL 초안): [.claude/밍기적-챌린지-서버설계.md](.claude/밍기적-챌린지-서버설계.md) · 원본 Claude 아티팩트
- 화면 설계(모바일·데스크톱 보드, 도장 컴포넌트, 에셋): [.claude/밍기적 챌린지 화면 설계.pdf](<.claude/밍기적 챌린지 화면 설계.pdf>) · 원본 Claude 아티팩트 (보드별 `.dc.html` 소스와 이미지 에셋은 원본 캔버스의 `project/` 아래에 있다)

원본을 고치면 로컬 사본도 다시 내보낸다.

## 코드베이스 규칙

- Next.js 16 App Router + React 19 + TypeScript(strict). `src/` 디렉터리 없이 루트의 `app/`을 쓴다.
- 경로 별칭 `@/*`는 저장소 루트를 가리킨다.
- Tailwind CSS v4: `tailwind.config` 파일이 없다. 디자인 토큰은 `app/globals.css`의 `@theme`에 등록한다.
- `pnpm-workspace.yaml`의 `allowBuilds`가 `sharp`, `unrs-resolver`의 빌드 스크립트를 막고 있다.

## 폴더 구조

`app/`은 라우팅 파일(`page`, `layout`, `route` 등)만 두고, 나머지 코드는 루트의 공용 폴더에 둔다. 빈 폴더는 `.gitkeep`으로 유지하며, 첫 파일이 생기면 지운다.

```text
app/
  records/              /records
  api/today/            GET /api/today  (draw/, reroll/, complete/ 아래에 각 POST)
  api/records/          GET /api/records?month=YYYY-MM
components/
  ui/                   손그림 카드 테두리, 버튼, 칩·배지, 구분선 등 공통 요소
  stamp/                도장 컴포넌트(p01–p06, mini)
  nav/                  모바일 하단 탭, 데스크톱 상단 헤더
  auth/                 앱을 열 때 익명 로그인(화면 없음)
  home/                 홈 전용(카드 더미·스택, 완료 연출, 연속 달성, 최근 기록)
  records/              기록 전용(월간 캘린더, 날짜 상세)
lib/
  supabase/             @supabase/ssr 클라이언트(server.ts, client.ts)
  api.ts                브라우저용 API 호출 도우미(익명 로그인, 401 재시도)
  api-server.ts         Route Handler 공통 처리(세션 확인 → RPC), api-error.ts 에러 코드 → HTTP
types/                  api.ts(API 응답 타입), database.ts(`pnpm gen:types`로 만든 DB 타입. 손으로 고치지 않는다)
supabase/
  migrations/           서버 설계의 SQL 초안 1~6. 시드(7)는 supabase/seed.sql
public/images/
  mascot/               티라노 마스코트 포즈 16종(투명 PNG, tyrano-*.png): basic(기본), challenge(도전 중),
                        did-it(해냈다), done(완료), excited(신남), favorite(쿠키), reading(책 읽기),
                        thinking(고민 중), hard(어려워), stretching(기지개), watering(물 주기),
                        spacing-out(멍), sleeping(자는 중), fail(실패), sad(슬픔), angry(화남)
  stamps/               도장 p01–p06 SVG(지름 190px, Gaegu 서브셋 내장). png/에 @2x·@4x
  stamps/mini/          달력·최근 기록용 작은 도장 SVG(문구 없음). png/에 @2x
  decor/                낙서 장식(꽃, 하트, 음표, 반짝이, 별, 소용돌이, 테이프)
  lines/                구분선(크레용, 점선, 물결)
  paper-texture.png     도화지 텍스처(320px 타일)
```

앱 아이콘은 Next.js 파일 규칙에 따라 `app/icon.png`(512px)과 `app/apple-icon.png`(192px)에 둔다. 하단 탭 아이콘은 선택 상태에 따라 색(`currentColor`)을 바꿔야 해서 SVG 파일 대신 `components/nav/nav-items.tsx`에 인라인으로 둔다.

4단계(`/settings`, `/admin`)용 폴더는 만들지 않았다.

## 제품: 밍기적 챌린지

하루 1개의 가벼운 미션을 랜덤으로 뽑아 자기신고로 완료하고, 도장이 그림일기식 달력에 쌓이는 모바일 우선 웹앱이다.

- 경로: `/`(홈), `/records`(기록). `/settings`, `/admin`은 4단계(보류)로, 만들지 않을 수도 있다.
- 홈은 서버가 주는 `state`로 화면을 고른다: `not_drawn`(뽑기 전) → `challenge`(도전중) → `done`(연속 달성). 완료 직후에는 도장 연출을 거쳐 연속 달성으로 넘어간다.
- 재뽑기는 하루 3회(첫 카드 포함 최대 4장), 완료 취소 없음, 미완료는 기록하지 않음(실패 상태 없음).
- 모바일은 하단 탭 2개 + 카드 스와이프, 데스크톱은 상단 헤더 내비게이션 + 2단(최대 1040px) + 버튼으로만 재뽑기.

## 설계 결정

- **스택**: Supabase(Postgres, 익명 로그인, RLS) + `@supabase/ssr`, Motion(카드 드래그·도장 연출), date-fns + `@date-fns/tz`, `next/font/google`의 Gaegu·Noto Sans KR, Vercel 배포. 별도 상태 관리 라이브러리는 쓰지 않는다.
- **쓰기 경로**: 클라이언트 → Route Handler(`app/api/.../route.ts`) → `supabase.rpc()` → security definer Postgres 함수. Server Action은 쓰지 않는다. 테이블에 쓰기 정책이 없어 모든 쓰기는 함수가 맡고, service role 키는 쓰지 않는다.
- **API 5개**: `GET /api/today`, `POST /api/today/draw`, `POST /api/today/reroll`, `POST /api/today/complete`, `GET /api/records?month=YYYY-MM`. 상태 변경 API는 모두 `/api/today`와 같은 모양(`date`, `state`, `mission`, `rerollsLeft`, `completedAt`, `stampId`, `streak`, `totalCompleted`, `recent`)을 돌려준다.
- **날짜**: 하루는 Asia/Seoul 기준이고 DB의 `kst_day()`(도착 시각 − 1분)만 믿는다. 화면은 날짜를 직접 계산하지 않고 `/api/today`가 준 `date`를 그대로 쓰며, 변경 요청에 그 `date`를 보낸다. 서버 날짜와 다르면 `DAY_CHANGED`(409)를 받고 오늘 상태를 다시 불러온다.
- **에러**: DB 함수가 코드를 예외 메시지로 던지고(`NO_REROLLS`, `ALREADY_DRAWN` 등) Route Handler가 HTTP 상태와 `{ "error": { "code", "message" } }`로 바꾼다.
- **뽑기 규칙**(서버에서만 처리): 180일 내 완료한 미션, 14일 내 넘긴 미션, 오늘 본 미션을 제외하고 균등 랜덤. 후보가 없으면 가장 오래전에 본 미션부터.
- **데이터**: `missions`(ID `E001–E180`, `C01–C20`, 삭제 대신 `is_active=false`), `daily_entries`(사용자·날짜당 1행).
- **도장**: 6종(`p01`–`p06`)을 서버가 랜덤으로 정해 `stamp_id`에 저장한다. 화면에서는 `variant`·`size`·`mini`를 받는 SVG 컴포넌트 하나로 그린다(mini는 문구 없이 틀과 그림만).
- **비주얼**: 크레파스 손그림 + 그림일기 톤. 테두리·구분선은 CSS 직선 대신 SVG 손그림 선(turbulence 필터). 다크 모드는 지원하지 않는다(초기 템플릿의 `prefers-color-scheme: dark` 블록은 제거 대상). `prefers-reduced-motion`이면 페이드만 쓴다. 색·폰트 기준값은 기획서 '디자인 기준값' 표를 따른다.
