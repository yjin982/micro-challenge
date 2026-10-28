-- ============================================================
-- 완료 메모(추가 기능 계획 1번): daily_entries.note, clean_note, complete_today(메모), set_note,
-- today_state·get_month에 note
--
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run. 한 트랜잭션이라 중간에 실패하면 아무것도 바뀌지 않는다.
--       다시 실행해도 된다(컬럼·제약은 있으면 건너뛰고, 함수는 덮어쓴다).
-- 확인: supabase/tests/entry-note.sql
-- 배포 순서: 이 SQL을 먼저 실행해도 지금 배포된 화면은 그대로 동작한다
--   (complete_today의 메모 인자에 기본값이 있고, 응답에 note가 늘어날 뿐이다).
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. 컬럼과 제약
--   · note: 완료할 때 남긴 메모. 비면 null. 200자 이하, 줄바꿈 없음
--   · note_updated_at: 메모를 마지막으로 쓰거나 고친 때(지우면 null)
--   · 메모는 완료한 날에만 있을 수 있다
-- ------------------------------------------------------------
alter table public.daily_entries
  add column if not exists note text,
  add column if not exists note_updated_at timestamptz;

alter table public.daily_entries drop constraint if exists daily_entries_note_check;
alter table public.daily_entries add constraint daily_entries_note_check
  check (note is null or (note <> '' and note !~ '[\r\n]' and char_length(note) <= 200));

alter table public.daily_entries drop constraint if exists daily_entries_note_needs_completion;
alter table public.daily_entries add constraint daily_entries_note_needs_completion
  check (note is null or completed_at is not null);


-- ------------------------------------------------------------
-- clean_note(글): 메모 입력 정리
--   줄바꿈·탭 등 공백 문자를 공백 하나로, 연달은 공백도 하나로, 앞뒤 공백을 지운다. 남는 게 없으면 null
--   · 내부용: 사용자가 직접 부를 일이 없어 실행 권한을 거둔다(아래 4번)
-- ------------------------------------------------------------
create or replace function public.clean_note(p text)
returns text language sql immutable set search_path = public as $$
  select nullif(btrim(regexp_replace(coalesce(p, ''), '\s+', ' ', 'g')), '')
$$;


-- ------------------------------------------------------------
-- 2. 기존 함수에 note 더하기
-- ------------------------------------------------------------

-- today_state: 1번 SQL과 같고 'note'(오늘 메모, 홈 완료 카드용)만 더했다
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
    select date, date - (row_number() over (order by date))::int as grp from done
  )
  select jsonb_build_object(
    'date', p_day,
    'state', case when not exists (select 1 from e) then 'not_drawn'
                  when (select completed_at from e) is null then 'challenge'
                  else 'done' end,
    'mission', (select jsonb_build_object('id', m.id, 'text', m.text, 'difficulty', m.difficulty)
                from e join missions m on m.id = e.current_mission_id),
    'rerollsLeft', coalesce(3 - (select reroll_count from e), 3),
    'completedAt', (select completed_at from e),
    'stampId', (select stamp_id from e),
    'note', (select note from e),                                       -- 오늘 메모(없으면 null)
    'streak', (select count(*) from g
               where grp = (select g2.grp from g g2, start where g2.date = start.d)),
    'totalCompleted', (select count(*) from done),
    'recent', coalesce((select jsonb_agg(r order by r.date desc) from (
        select e2.date, m.text as "missionText", e2.stamp_id as "stampId"
        from daily_entries e2 join missions m on m.id = e2.current_mission_id
        where e2.user_id = p_user and e2.completed_at is not null
        order by e2.date desc limit 3) r), '[]'::jsonb)
  )
$$;

-- get_month: 1번 SQL과 같고 days[]에 'note'만 더했다
create or replace function public.get_month(p_month date)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'month', to_char(p_month, 'YYYY-MM'),
    'firstMonth', (select to_char(min(date), 'YYYY-MM') from daily_entries where user_id = auth.uid()),
    'days', coalesce((
      select jsonb_agg(jsonb_build_object('date', e.date, 'missionText', m.text,
               'stampId', e.stamp_id, 'completedAt', e.completed_at, 'note', e.note) order by e.date)
      from daily_entries e join missions m on m.id = e.current_mission_id
      where e.user_id = auth.uid() and e.completed_at is not null
        and e.date >= p_month and e.date < (p_month + interval '1 month')::date
    ), '[]'::jsonb)
  )
$$;


-- ------------------------------------------------------------
-- complete_today(날짜, 메모?)  ← POST /api/today/complete
--   1번 SQL의 complete_today(date)에 메모 인자를 더했다. 인자가 바뀌면 Postgres는 다른 함수로 보므로
--   예전 것을 지우고 새로 만든다. p_note에 기본값이 있어 메모 없이 부르던 화면도 그대로 동작한다.
--   · 메모는 clean_note로 정리하고, 200자를 넘으면 INVALID_INPUT(완료도 되지 않는다)
-- ------------------------------------------------------------
drop function if exists public.complete_today(date);

create or replace function public.complete_today(p_date date, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_day date := kst_day(); v_note text := clean_note(p_note); e daily_entries;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_date is distinct from v_day then raise exception 'DAY_CHANGED'; end if;
  if char_length(v_note) > 200 then raise exception 'INVALID_INPUT'; end if;
  select * into e from daily_entries where user_id = v_uid and date = v_day for update;  -- 연타 방지용 잠금
  if not found then raise exception 'NOT_DRAWN'; end if;
  if e.completed_at is not null then raise exception 'ALREADY_COMPLETED'; end if;
  update daily_entries
     set completed_at = now(),
         stamp_id = (array['p01','p02','p03','p04','p05','p06'])[1 + floor(random() * 6)::int],
         note = v_note,
         note_updated_at = case when v_note is null then null else now() end
   where user_id = v_uid and date = v_day;
  return today_state(v_uid, v_day);
end $$;


-- ------------------------------------------------------------
-- set_note(날짜, 메모)  ← PATCH /api/records/note
--   내가 완료한 날의 메모를 쓰거나 고치거나 지운다(정리한 결과가 비면 지운다).
--   · 고칠 수 있는 것은 메모뿐이다. 완료 여부·시각·도장은 그대로
--   · 그날 행이 없거나 완료 전이면 NOT_FOUND. 다른 사람의 행은 auth.uid() 조건이라 건드릴 수 없다
--   돌려주는 값: { "date", "note", "noteUpdatedAt" }
-- ------------------------------------------------------------
create or replace function public.set_note(p_date date, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_note text := clean_note(p_note); v_at timestamptz;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_date is null or char_length(v_note) > 200 then raise exception 'INVALID_INPUT'; end if;
  update daily_entries
     set note = v_note,
         note_updated_at = case when v_note is null then null else now() end
   where user_id = v_uid and date = p_date and completed_at is not null
  returning note_updated_at into v_at;
  if not found then raise exception 'NOT_FOUND'; end if;
  return jsonb_build_object('date', p_date, 'note', v_note, 'noteUpdatedAt', v_at);
end $$;


-- ------------------------------------------------------------
-- 4. 실행 권한(1번 SQL의 6. 실행 권한과 같은 방식)
-- ------------------------------------------------------------
revoke execute on function public.clean_note(text) from public, anon, authenticated;

revoke execute on function
  public.complete_today(date, text), public.set_note(date, text)
  from public, anon;

grant execute on function
  public.complete_today(date, text), public.set_note(date, text)
  to authenticated;

-- API(PostgREST)가 바뀐 함수 목록을 바로 다시 읽게 한다
notify pgrst, 'reload schema';

commit;
