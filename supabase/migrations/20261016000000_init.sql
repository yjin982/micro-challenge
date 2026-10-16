-- 밍기적 챌린지 초기 스키마: 서버 설계 문서의 '테이블 SQL 초안' 1~6을 그대로 옮겼다.
-- Supabase SQL Editor에 이 파일 전체를 붙여넣고 한 번 실행한다. 시드는 supabase/seed.sql.
-- 4단계(보류) 부록 SQL은 넣지 않았다.

-- ============================================================
-- 1. 날짜 도우미 함수
-- ============================================================
-- 도착 시각 - 1분을 한국 날짜로 (00:00:59 도착까지는 전날)
create or replace function public.kst_day(ts timestamptz default now())
returns date language sql stable as $$
  select ((ts - interval '1 minute') at time zone 'Asia/Seoul')::date
$$;

-- ============================================================
-- 2. 테이블
-- ============================================================
create table public.missions (
  id          text primary key,                 -- E001~E180, C01~C20 (4단계를 만들면 S0001~)
  text        text not null check (btrim(text) <> ''),     -- 길이 제한 없음(빈 문구만 막음)
  difficulty  text not null check (difficulty in ('easy', 'challenge')),
  category    text,                             -- 내부 분류 (4단계 제출분은 null)
  source      text not null default 'seed' check (source in ('seed', 'user')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.daily_entries (
  user_id            uuid not null references auth.users (id) on delete cascade,
  date               date not null,             -- kst_day() 기준
  current_mission_id text not null references public.missions (id),
  seen_mission_ids   text[] not null default '{}',
  reroll_count       int not null default 0 check (reroll_count between 0 and 3),
  completed_at       timestamptz,
  stamp_id           text check (stamp_id in ('p01','p02','p03','p04','p05','p06')),
  created_at         timestamptz not null default now(),
  primary key (user_id, date),
  check ((completed_at is null) = (stamp_id is null))
);
create index daily_entries_done_idx
  on public.daily_entries (user_id, date desc) where completed_at is not null;

-- ============================================================
-- 3. 접근 규칙(RLS)
-- ============================================================
alter table public.missions      enable row level security;
alter table public.daily_entries enable row level security;

create policy "missions: 사용 중인 미션 읽기" on public.missions
  for select to anon, authenticated using (is_active);

create policy "daily_entries: 본인 행 읽기" on public.daily_entries
  for select to authenticated using (user_id = (select auth.uid()));

-- insert/update/delete 정책은 만들지 않는다 → 아래 함수로만 쓴다.
-- missions의 추가·비활성화는 운영자가 대시보드(Table Editor, SQL Editor)에서 직접 한다.

-- ============================================================
-- 4. 내부 도우미(뽑기 규칙, 오늘 상태)
-- ============================================================
-- ============================================================
-- [공통 서식 읽는 법]
--  create or replace function 이름(인자 타입, ...)  : 함수를 만들거나 덮어쓴다
--  returns 타입       : 돌려주는 값의 타입 (boolean, text, jsonb ...)
--  language sql      : 본문이 SELECT 한 문장뿐인 간단한 함수
--  language plpgsql  : 변수, if, 여러 문장을 쓸 수 있는 함수 (JS 함수와 비슷)
--  stable / volatile : stable = 읽기만 함, volatile = random()처럼 매번 결과가 다를 수 있음
--  security definer  : 호출한 사람이 아니라 '함수를 만든 관리자' 권한으로 실행된다.
--                      RLS 때문에 사용자가 직접 못 보는 표도 읽을 수 있으므로,
--                      함수 안에서 반드시 '누구 것만 볼지'를 직접 걸러야 한다.
--  set search_path = public : 표 이름을 public 스키마에서만 찾는다 (보안용 관례)
--  $$ ... $$         : 함수 본문을 감싸는 따옴표. 안에서 ' 를 그대로 쓸 수 있다
--  auth.uid()        : 지금 로그인한 사용자의 id (익명 포함). 로그인 안 했으면 null
-- ============================================================


-- ------------------------------------------------------------
-- pick_mission(사용자, 오늘 날짜, 오늘 이미 본 미션 목록): 뽑기 규칙
--   돌려주는 값: 뽑힌 미션 id 하나 (예: 'E021')
--
--   1차 후보 = 사용 중인 미션 전체
--                  - 최근 180일 안에 완료한 미션   (done)
--                  - 최근 14일 안에 넘긴 미션    (skipped)
--                  - 오늘 이미 본 미션          (p_seen)
--                  → 이 중 하나를 무작위로
--   2차(1차 후보가 하나도 없을 때) = 오늘 본 것만 빼고,
--                  마지막으로 본 날이 가장 오래된 미션부터
--
--   · 180일/14일은 무언가를 꺼 두는 게 아니라 뽑을 때마다 daily_entries를 보고 계산한다.
--     그래서 기간이 지나면 따로 복구하지 않아도 다시 후보가 된다.
--   · 내부용: SQL 6번에서 사용자가 직접 부르지 못하게 막는다
-- ------------------------------------------------------------
create or replace function public.pick_mission(p_user uuid, p_day date, p_seen text[])
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_id text;   -- 결과를 담을 변수 (JS의 let v_id)
begin
  -- with A as (...), B as (...) : 아래 select에서 쓸 임시 표(이름 붙인 하위 쿼리)
  with done as (
    -- 내가 최근 180일 안에 완료한 미션 id들
    select current_mission_id as id from daily_entries
    where user_id = p_user and completed_at is not null and date > p_day - 180
  ), skipped as (
    -- 내가 최근 14일(오늘 제외) 동안 본 미션 중 그날 완료하지 않은 것 = 넘긴 미션
    -- unnest(배열): seen_mission_ids 배열을 한 줄에 하나씩 펼친다
    select s.id from daily_entries e, unnest(e.seen_mission_ids) as s(id)
    where e.user_id = p_user and e.date > p_day - 14 and e.date < p_day
      -- 그날 완료한 미션은 '넘긴 것'이 아니므로 뺀다
      and s.id is distinct from (case when e.completed_at is not null then e.current_mission_id end)
  )
  select m.id into v_id from missions m          -- into v_id: 결과를 변수에 담는다
  where m.is_active                              -- 운영자가 끈 미션 제외
    and m.id <> all (p_seen)                     -- 오늘 본 미션 제외 (배열의 어느 값과도 다름)
    and m.id not in (select id from done)        -- 180일 내 완료 제외
    and m.id not in (select id from skipped)     -- 14일 내 넘긴 것 제외
  order by random() limit 1;                     -- 무작위로 섞어 하나만

  -- 1차 후보가 없으면(v_id가 비어 있으면) 2차 규칙
  if v_id is null then
    select m.id into v_id from missions m
    -- left join lateral: 미션마다 '내가 마지막으로 본 날'을 구해 붙인다 (못 본 미션은 null)
    left join lateral (
      select max(e.date) as last_seen from daily_entries e
      where e.user_id = p_user and m.id = any (e.seen_mission_ids)
    ) l on true
    where m.is_active and m.id <> all (p_seen)
    order by l.last_seen asc nulls first,        -- 한 번도 안 본 것 → 오래전에 본 것 순
             random() limit 1;                   -- 같은 날이면 무작위
  end if;
  return v_id;
end $$;


-- ------------------------------------------------------------
-- today_state(사용자, 오늘 날짜): GET /api/today 응답 JSON을 만든다
--   돌려주는 값 예: { "date", "state", "mission", "rerollsLeft", "completedAt",
--                    "stampId", "streak", "totalCompleted", "recent" }
--   · 뽑기·재뽑기·완료 함수도 끝난 뒤 이 함수를 불러 같은 모양으로 응답한다
--   · 내부용: 사용자는 get_today()를 통해서만 부른다
-- ------------------------------------------------------------
create or replace function public.today_state(p_user uuid, p_day date)
returns jsonb language sql stable security definer set search_path = public as $$
  with e as (
    -- 오늘 행 (없으면 아직 뽑기 전)
    select * from daily_entries where user_id = p_user and date = p_day
  ),
  done as (
    -- 내가 완료한 날짜 전부
    select date from daily_entries where user_id = p_user and completed_at is not null
  ),
  start as (
    -- 연속 계산 시작점: 오늘 완료했으면 오늘, 아니면 어제
    select case when exists (select 1 from done where date = p_day)
                then p_day else p_day - 1 end as d
  ),
  g as (
    -- 연속된 날 묶기: 날짜에서 순번(1,2,3...)을 빼면 연속된 날들은 같은 값(grp)이 된다
    --   예) 9/25,26,27 → 순번 1,2,3 → 9/24,9/24,9/24 (같은 묶음)
    --       9/29 → 순번 4 → 9/25 (다른 묶음, 하루가 비었기 때문)
    select date, date - (row_number() over (order by date))::int as grp from done
  )
  select jsonb_build_object(                     -- jsonb_build_object('키', 값, ...): JSON 객체 만들기
    'date', p_day,
    'state', case when not exists (select 1 from e) then 'not_drawn'      -- 오늘 행 없음
                  when (select completed_at from e) is null then 'challenge'  -- 뽑았지만 미완료
                  else 'done' end,                                         -- 완료
    'mission', (select jsonb_build_object('id', m.id, 'text', m.text, 'difficulty', m.difficulty)
                from e join missions m on m.id = e.current_mission_id),   -- 뽑기 전이면 null
    'rerollsLeft', coalesce(3 - (select reroll_count from e), 3),          -- coalesce(a, b): a가 null이면 b
    'completedAt', (select completed_at from e),
    'stampId', (select stamp_id from e),
    -- 시작점(오늘 또는 어제)이 속한 묶음의 날 수 = 연속 일수. 시작점이 완료 날이 아니면 0
    'streak', (select count(*) from g
               where grp = (select g2.grp from g g2, start where g2.date = start.d)),
    'totalCompleted', (select count(*) from done),
    -- 최근 완료 3개 (최신순). 하나도 없으면 빈 배열 []
    'recent', coalesce((select jsonb_agg(r order by r.date desc) from (
        select e2.date, m.text as "missionText", e2.stamp_id as "stampId"
        from daily_entries e2 join missions m on m.id = e2.current_mission_id
        where e2.user_id = p_user and e2.completed_at is not null
        order by e2.date desc limit 3) r), '[]'::jsonb)
  )
$$;

-- ============================================================
-- 5. API가 부르는 함수
-- ============================================================
-- ============================================================
-- [이 블록에서 새로 나오는 서식]
--  declare 변수 타입 := 값;   : 함수 안에서 쓸 변수 선언 (JS의 let)
--  raise exception '코드'    : 에러를 던지고 즉시 멈춘다 (JS의 throw).
--                              이 함수에서 바꾼 내용은 모두 취소된다.
--                              Route Handler는 error.message로 코드를 받아 HTTP 상태로 바꾼다
--  is distinct from          : '다르다'(<>)와 같되 null도 제대로 비교한다
--  select * into e ... for update
--                            : 행을 읽어 변수 e에 담고, 이 함수가 끝날 때까지 잠근다.
--                              같은 행을 동시에 건드리는 다른 요청(다른 탭)은 줄을 서서 기다린다
--  if not found then         : 바로 앞의 select/update가 행을 못 찾았으면
--  exception when ... then   : 함수 안에서 특정 DB 에러가 나면 잡아서 처리 (JS의 catch)
--
-- [각 함수의 공통 순서]
--  1) 로그인 확인  2) 날짜 확인  3) 규칙 검사  4) 쓰기  5) today_state()로 응답
-- ============================================================


-- ------------------------------------------------------------
-- get_today()  ← GET /api/today
--   오늘 상태를 돌려준다. 읽기만 하고 아무것도 바꾸지 않는다
-- ------------------------------------------------------------
create or replace function public.get_today()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;  -- 세션 없으면 거절
  return today_state(auth.uid(), kst_day());   -- kst_day(): 자정 1분 유예를 반영한 '오늘'
end $$;


-- ------------------------------------------------------------
-- draw_first(화면이 아는 날짜)  ← POST /api/today/draw
--   그날 첫 카드를 뽑는다. 재뽑기 횟수에는 들어가지 않는다.
--   오늘 행(daily_entries)을 이 함수가 처음 만든다
-- ------------------------------------------------------------
create or replace function public.draw_first(p_date date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_day date := kst_day(); v_id text;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  -- 화면을 켜둔 채 자정이 지났으면 화면의 날짜와 서버 날짜가 다르다 → 다시 불러오게 한다
  if p_date is distinct from v_day then raise exception 'DAY_CHANGED'; end if;
  v_id := pick_mission(v_uid, v_day, '{}');     -- '{}' = 빈 배열(오늘 본 미션 없음)
  insert into daily_entries (user_id, date, current_mission_id, seen_mission_ids)
  values (v_uid, v_day, v_id, array[v_id]);    -- 본 목록에 첫 카드를 넣어 둔다
  return today_state(v_uid, v_day);
exception when unique_violation then
  -- (user_id, date)가 이미 있음 = 다른 탭에서 먼저 뽑았다. 기본키 덕분에 두 번 들어갈 수 없다
  raise exception 'ALREADY_DRAWN';
end $$;


-- ------------------------------------------------------------
-- reroll_today(화면이 아는 날짜)  ← POST /api/today/reroll
--   오늘 카드를 다른 미션으로 바꾼다. 하루 최대 3번
-- ------------------------------------------------------------
create or replace function public.reroll_today(p_date date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_day date := kst_day(); e daily_entries; v_id text;
        -- e daily_entries: daily_entries 한 행을 통째로 담는 변수 (e.reroll_count처럼 쓴다)
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_date is distinct from v_day then raise exception 'DAY_CHANGED'; end if;
  -- 오늘 행을 잠그고 읽는다. 두 탭에서 동시에 눌러도 한 번에 하나씩만 처리되어 횟수가 꼬이지 않는다
  select * into e from daily_entries where user_id = v_uid and date = v_day for update;
  if not found then raise exception 'NOT_DRAWN'; end if;                      -- 아직 뽑기 전
  if e.completed_at is not null then raise exception 'ALREADY_COMPLETED'; end if;  -- 이미 완료
  if e.reroll_count >= 3 then raise exception 'NO_REROLLS'; end if;          -- 3번 다 씀
  v_id := pick_mission(v_uid, v_day, e.seen_mission_ids);  -- 오늘 본 것들을 빼고 뽑기
  update daily_entries
     set current_mission_id = v_id,                    -- 지금 카드 교체
         seen_mission_ids = seen_mission_ids || v_id,  -- ||: 배열 끝에 추가 (JS의 push)
         reroll_count = reroll_count + 1
   where user_id = v_uid and date = v_day;
  return today_state(v_uid, v_day);
end $$;


-- ------------------------------------------------------------
-- complete_today(화면이 아는 날짜)  ← POST /api/today/complete
--   오늘 미션을 완료 처리하고 도장 6종 중 하나를 무작위로 정한다. 취소는 없다
-- ------------------------------------------------------------
create or replace function public.complete_today(p_date date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_day date := kst_day(); e daily_entries;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  -- 23:59에 누른 완료가 00:00대에 도착해도 kst_day()가 전날이라 통과한다
  if p_date is distinct from v_day then raise exception 'DAY_CHANGED'; end if;
  select * into e from daily_entries where user_id = v_uid and date = v_day for update;  -- 연타 방지용 잠금
  if not found then raise exception 'NOT_DRAWN'; end if;
  if e.completed_at is not null then raise exception 'ALREADY_COMPLETED'; end if;
  update daily_entries
     set completed_at = now(),
         -- random()은 0 이상 1 미만 → ×6 후 내림하면 0~5 → +1 하면 1~6번째 (SQL 배열은 1부터 시작)
         stamp_id = (array['p01','p02','p03','p04','p05','p06'])[1 + floor(random() * 6)::int]
   where user_id = v_uid and date = v_day;
  return today_state(v_uid, v_day);
end $$;


-- ------------------------------------------------------------
-- get_month(그 달 1일)  ← GET /api/records?month=2026-09
--   Route Handler가 '2026-09'를 '2026-09-01'로 바꿔 넘긴다.
--   그 달에 완료한 날들과, 처음 앱을 쓴 달(이전 달 화살표를 막는 데 씀)을 돌려준다
-- ------------------------------------------------------------
create or replace function public.get_month(p_month date)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'month', to_char(p_month, 'YYYY-MM'),                     -- to_char: 날짜를 문자열 형식으로
    'firstMonth', (select to_char(min(date), 'YYYY-MM') from daily_entries where user_id = auth.uid()),
    'days', coalesce((
      -- jsonb_agg: 여러 행을 JSON 배열 하나로 묶는다 (날짜순)
      select jsonb_agg(jsonb_build_object('date', e.date, 'missionText', m.text,
               'stampId', e.stamp_id, 'completedAt', e.completed_at) order by e.date)
      from daily_entries e join missions m on m.id = e.current_mission_id
      where e.user_id = auth.uid() and e.completed_at is not null      -- 본인, 완료한 날만
        and e.date >= p_month and e.date < (p_month + interval '1 month')::date  -- 그 달 1일~말일
    ), '[]'::jsonb)                                              -- 없으면 빈 배열
  )
$$;

-- ============================================================
-- 6. 실행 권한
-- ============================================================
-- Postgres는 함수 실행 권한을 기본으로 모두에게 준다. 내부 도우미는 막고,
-- API 함수는 로그인한 사용자(익명 포함)에게만 연다.
revoke execute on function
  public.pick_mission(uuid, date, text[]), public.today_state(uuid, date)
  from public, anon, authenticated;

revoke execute on function
  public.get_today(), public.draw_first(date), public.reroll_today(date),
  public.complete_today(date), public.get_month(date)
  from public, anon;

grant execute on function
  public.get_today(), public.draw_first(date), public.reroll_today(date),
  public.complete_today(date), public.get_month(date)
  to authenticated;
