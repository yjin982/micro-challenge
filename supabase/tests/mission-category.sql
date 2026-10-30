-- ============================================================
-- 오늘 미션의 분류 확인: get_today의 mission.category
--
-- 먼저 supabase/migrations/20261030010000_mission_category.sql을 실행해 둔다.
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run.
--   · 임시 익명 사용자를 만들고 그 사용자로 로그인한 것처럼 get_today를 부른다.
--     마지막에 일부러 오류를 내서 전부 되돌린다(entry-note.sql과 같은 방식).
--   · 결과 맨 앞이 'ALL PASS'면 통과, 'FAIL'이면 FAIL 줄을 확인한다.
-- ============================================================
do $$
declare
  u1 uuid := gen_random_uuid();   -- 오늘 E001(몸/행동) 도전중
  u2 uuid := gen_random_uuid();   -- 뽑기 전
  d date := public.kst_day();
  r jsonb;
  report text := '';
  failed boolean := false;
  ok boolean;
begin
  insert into auth.users (id, instance_id, aud, role, is_anonymous) values
    (u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true),
    (u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true);
  insert into public.daily_entries (user_id, date, current_mission_id, seen_mission_ids) values
    (u1, d, 'E001', '{E001}');

  -- 1. 도전중이면 mission.category가 missions.category와 같다
  perform set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    r := public.get_today();
    reset role;
  exception when others then
    reset role;
    r := jsonb_build_object('error', sqlerrm);
  end;
  ok := r ->> 'state' = 'challenge'
        and r -> 'mission' ->> 'category' = (select category from public.missions where id = 'E001')
        and r -> 'mission' ->> 'text' is not null;
  failed := failed or not ok;
  report := report || format(E'%s [도전중 분류] state=%s, category=%s(기대 challenge, %s)\n',
    case when ok then 'PASS' else 'FAIL' end, coalesce(r ->> 'state', r ->> 'error'),
    r -> 'mission' ->> 'category', (select category from public.missions where id = 'E001'));

  -- 2. 뽑기 전이면 mission이 null(그대로)
  perform set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    r := public.get_today();
    reset role;
  exception when others then
    reset role;
    r := jsonb_build_object('error', sqlerrm);
  end;
  ok := r ->> 'state' = 'not_drawn' and r -> 'mission' = 'null'::jsonb;
  failed := failed or not ok;
  report := report || format(E'%s [뽑기 전] state=%s, mission=%s(기대 not_drawn, null)\n',
    case when ok then 'PASS' else 'FAIL' end, coalesce(r ->> 'state', r ->> 'error'), r -> 'mission');

  -- 결과를 보여주고 전부 되돌린다
  raise exception E'%\n%(이 메시지는 결과를 보여주려고 일부러 낸 오류이고, 만든 데이터는 모두 되돌려졌습니다)',
    case when failed then 'FAIL: 아래에서 FAIL 줄을 확인하세요' else 'ALL PASS' end, report;
end $$;
