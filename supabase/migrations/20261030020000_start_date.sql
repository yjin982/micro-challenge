-- ============================================================
-- 시작한 날(startDate) 내려주기(2026-10-30)
--   기록 달력에 계정을 만든 날(시작한 날)을 작은 티라노로 표시하고, 누르면 '시작한 날' 카드를 보여준다.
--   · get_month에 'startDate'(계정을 만든 날, kst_day 기준)를 더한다
--   · 'firstMonth'(이전 달로 넘길 수 있는 첫 달)를 첫 기록 달과 시작한 달 중 이른 달로 바꾼다.
--     계정을 만들고 며칠 뒤에 처음 뽑았어도 시작한 날이 있는 달까지 넘겨 볼 수 있다.
--   익명에 Google을 연결한 계정은 사용자가 그대로라 익명으로 시작한 날이 시작한 날이다.
--
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run. 한 트랜잭션이라 실패하면 아무것도 바뀌지 않는다.
-- 확인: supabase/tests/start-date.sql
-- 응답에 필드가 늘어날 뿐이라 지금 배포된 화면·API는 그대로 동작한다(먼저 실행해도 된다).
-- ============================================================

begin;

-- get_month: 20261028000000_entry_note.sql과 같고 'startDate'를 더하고 'firstMonth'에 시작한 달을 넣었다.
-- auth.users는 함수 주인(security definer) 권한으로 읽고, 본인(auth.uid()) 것만 본다.
create or replace function public.get_month(p_month date)
returns jsonb language sql stable security definer set search_path = public as $$
  with me as (
    select kst_day(created_at) as start_date from auth.users where id = auth.uid()
  )
  select jsonb_build_object(
    'month', to_char(p_month, 'YYYY-MM'),
    'startDate', (select start_date from me),
    'firstMonth', to_char(least(
                    (select min(date) from daily_entries where user_id = auth.uid()),
                    (select start_date from me)), 'YYYY-MM'),       -- least는 null을 건너뛴다(둘 다 없으면 null)
    'days', coalesce((
      select jsonb_agg(jsonb_build_object('date', e.date, 'missionText', m.text,
               'stampId', e.stamp_id, 'completedAt', e.completed_at, 'note', e.note) order by e.date)
      from daily_entries e join missions m on m.id = e.current_mission_id
      where e.user_id = auth.uid() and e.completed_at is not null
        and e.date >= p_month and e.date < (p_month + interval '1 month')::date
    ), '[]'::jsonb)
  )
$$;

-- create or replace는 실행 권한을 그대로 둔다(인자가 같아서). API가 바뀐 함수를 다시 읽게 한다
notify pgrst, 'reload schema';

commit;
