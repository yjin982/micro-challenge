-- ============================================================
-- 오늘 미션에 분류(category) 내려주기(2026-10-30)
--   홈 도전중 카드가 분류에 맞는 낙서 장식을 고른다(components/home/missionDecor.ts).
--   today_state의 'mission'에 'category'만 더한다. 분류가 없는 미션(나중의 미션 제안분)은 null.
--
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run. 한 트랜잭션이라 실패하면 아무것도 바뀌지 않는다.
-- 확인: supabase/tests/mission-category.sql
-- 응답에 필드가 늘어날 뿐이라 지금 배포된 화면·API는 그대로 동작한다(먼저 실행해도 된다).
-- ============================================================

begin;

-- today_state: 20261028000000_entry_note.sql과 같고 'mission'에 'category'만 더했다
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
    'mission', (select jsonb_build_object('id', m.id, 'text', m.text, 'difficulty', m.difficulty,
                                          'category', m.category)            -- 분류(없으면 null)
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

-- create or replace는 실행 권한을 그대로 둔다(내부용이라 사용자는 계속 부를 수 없다). API가 바뀐 함수를 다시 읽게 한다
notify pgrst, 'reload schema';

commit;
