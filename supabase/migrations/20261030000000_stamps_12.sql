-- ============================================================
-- 도장 12종과 겹치지 않게 찍기(2026-10-30)
--   · 도장을 p01–p06에서 p01–p12로 늘린다(p07 체고!, p08 당근이지, p09 작은 기적, p10 꽃길만, p11 꾹!, p12 둥실둥실)
--   · 완료할 때 그 사용자가 최근에 받은 도장 4개를 빼고 남은 8개 중에서 고른다(pick_stamp).
--     예전에는 6개 중 그냥 무작위라 사흘 연속 같은 도장이 나오기도 했다.
--     완료한 날끼리 비교하므로, 며칠 쉬었다 와도 마지막 4번과는 겹치지 않는다.
--
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run. 한 트랜잭션이라 실패하면 아무것도 바뀌지 않는다.
-- 확인: supabase/tests/stamps.sql
-- 인자는 그대로라 지금 배포된 화면·API도 그대로 동작한다. 단, 이 SQL을 실행한 뒤에는 p07–p12가 찍힐 수 있으므로
-- 새 도장을 그릴 줄 아는 화면(Stamp 컴포넌트 p07–p12)을 먼저 배포하거나 같이 배포한다.
-- ============================================================

begin;

-- 1. stamp_id 제약: 1번 SQL의 열 제약(이름은 Postgres가 붙인 daily_entries_stamp_id_check)을 12종으로 바꾼다.
--    이름이 다를 수 있어 도장 목록이 든 검사 제약을 찾아 지운다('(completed_at is null) = (stamp_id is null)' 제약은 남는다).
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
     where conrelid = 'public.daily_entries'::regclass and contype = 'c'
       and pg_get_constraintdef(oid) like '%p01%'
  loop
    execute format('alter table public.daily_entries drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.daily_entries add constraint daily_entries_stamp_id_check
  check (stamp_id in ('p01','p02','p03','p04','p05','p06','p07','p08','p09','p10','p11','p12'));

-- 2. pick_stamp(사용자, 날짜): 그 날 이전에 완료한 기록 중 최근 4개의 도장을 빼고 무작위로 하나.
--    내부 도우미라 complete_today(security definer) 안에서만 부른다.
create or replace function public.pick_stamp(p_uid uuid, p_day date)
returns text language sql volatile set search_path = public as $$
  select s
    from unnest(array['p01','p02','p03','p04','p05','p06','p07','p08','p09','p10','p11','p12']) as s
   where s not in (
     select stamp_id from daily_entries
      where user_id = p_uid and date < p_day and stamp_id is not null
      order by date desc
      limit 4)
   order by random()
   limit 1
$$;

revoke execute on function public.pick_stamp(uuid, date) from public, anon, authenticated;

-- 3. complete_today: 20261028010000_entry_note_100.sql과 같고 도장만 pick_stamp로
create or replace function public.complete_today(p_date date, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_day date := kst_day(); v_note text := clean_note(p_note); e daily_entries;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_date is distinct from v_day then raise exception 'DAY_CHANGED'; end if;
  if char_length(v_note) > 100 then raise exception 'INVALID_INPUT'; end if;
  select * into e from daily_entries where user_id = v_uid and date = v_day for update;  -- 연타 방지용 잠금
  if not found then raise exception 'NOT_DRAWN'; end if;
  if e.completed_at is not null then raise exception 'ALREADY_COMPLETED'; end if;
  update daily_entries
     set completed_at = now(),
         stamp_id = pick_stamp(v_uid, v_day),
         note = v_note,
         note_updated_at = case when v_note is null then null else now() end
   where user_id = v_uid and date = v_day;
  return today_state(v_uid, v_day);
end $$;

-- create or replace는 실행 권한을 그대로 둔다(인자가 같아서). API가 바뀐 함수를 다시 읽게 한다
notify pgrst, 'reload schema';

commit;
