-- ============================================================
-- 완료 메모 상한 200자 → 100자(2026-10-28 결정, 추가 기능 계획 1-8)
--   기록 화면의 그림일기 원고지(한 줄 12칸)에 100자면 최대 9줄이라 한 쪽으로 보기 좋다.
--
-- 실행 전에 따로 확인: 100자를 넘는 메모가 있으면 아래 제약을 걸 때 실패한다
--   select user_id, date, char_length(note) from public.daily_entries where char_length(note) > 100;
--   (있으면 지울지 100자로 자를지 정한 뒤 실행한다)
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run. 한 트랜잭션이라 실패하면 아무것도 바뀌지 않는다.
-- 확인: supabase/tests/entry-note.sql(경계값 100/101)
-- 인자는 그대로라 지금 배포된 화면·API는 그대로 동작한다(200자 화면이 101~200자를 보내면 INVALID_INPUT).
-- ============================================================

begin;

alter table public.daily_entries drop constraint if exists daily_entries_note_check;
alter table public.daily_entries add constraint daily_entries_note_check
  check (note is null or (note <> '' and note !~ '[\r\n]' and char_length(note) <= 100));

-- complete_today: 20261028000000_entry_note.sql과 같고 상한만 100
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
         stamp_id = (array['p01','p02','p03','p04','p05','p06'])[1 + floor(random() * 6)::int],
         note = v_note,
         note_updated_at = case when v_note is null then null else now() end
   where user_id = v_uid and date = v_day;
  return today_state(v_uid, v_day);
end $$;

-- set_note: 20261028000000_entry_note.sql과 같고 상한만 100
create or replace function public.set_note(p_date date, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_note text := clean_note(p_note); v_at timestamptz;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_date is null or char_length(v_note) > 100 then raise exception 'INVALID_INPUT'; end if;
  update daily_entries
     set note = v_note,
         note_updated_at = case when v_note is null then null else now() end
   where user_id = v_uid and date = p_date and completed_at is not null
  returning note_updated_at into v_at;
  if not found then raise exception 'NOT_FOUND'; end if;
  return jsonb_build_object('date', p_date, 'note', v_note, 'noteUpdatedAt', v_at);
end $$;

-- create or replace는 실행 권한을 그대로 둔다(인자가 같아서). API가 바뀐 함수를 다시 읽게 한다
notify pgrst, 'reload schema';

commit;
