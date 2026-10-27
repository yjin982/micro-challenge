-- ============================================================
-- 계정 삭제 확인: delete_my_account()가 auth.users와 기록을 지우는지, 권한이 맞는지
--
-- 먼저 supabase/migrations/20261027000000_delete_my_account.sql을 실행해 둔다.
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run.
--   · 임시 익명 사용자와 기록 2개를 만들고, 그 사용자로 로그인한 것처럼 함수를 부른다.
--     마지막에 일부러 오류를 내서 전부 되돌린다(draw-rules.sql과 같은 방식).
--     그래서 결과는 "오류" 메시지로 나오고, DB에는 아무것도 남지 않는다.
--   · 결과 맨 앞이 'ALL PASS'면 통과, 'FAIL'이면 FAIL 줄을 확인한다.
--   · 확인하는 것
--       1. 로그인한 사용자(authenticated)로 부르면 사용자·기록·identity가 모두 지워지는지
--       2. 같은 토큰으로 한 번 더 부르면 UNAUTHENTICATED인지(이미 지운 사용자)
--       3. 로그인하지 않은 요청(anon)은 실행 권한이 없는지
--       4. 다른 사용자의 기록은 그대로인지
-- ============================================================
do $$
declare
  u uuid := gen_random_uuid();       -- 지울 임시 익명 사용자
  other uuid := gen_random_uuid();   -- 그대로 남아야 하는 다른 임시 사용자
  d date := public.kst_day();
  result jsonb;
  n_users int;
  n_entries int;
  n_identities int;
  n_other int;
  report text := '';
  failed boolean := false;
  ok boolean;
begin
  insert into auth.users (id, instance_id, aud, role, is_anonymous)
  values (u, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true),
         (other, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true);
  -- Google 계정처럼 identity도 하나 붙여 둔다(함께 지워지는지 보려고)
  insert into auth.identities (provider_id, user_id, identity_data, provider)
  values (u::text, u, jsonb_build_object('sub', u::text), 'google');
  insert into public.daily_entries (user_id, date, current_mission_id, seen_mission_ids, completed_at, stamp_id) values
    (u, d - 1, 'E001', '{E001}', now(), 'p01'),
    (u, d,     'E002', '{E002}', null, null),
    (other, d, 'E003', '{E003}', now(), 'p02');

  -- ----------------------------------------------------------
  -- 1. 로그인한 사용자로 삭제
  -- ----------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    result := public.delete_my_account();
    reset role;
  exception when others then
    reset role;
    result := jsonb_build_object('error', sqlerrm, 'sqlstate', sqlstate);
  end;
  select count(*) into n_users from auth.users where id = u;
  select count(*) into n_entries from public.daily_entries where user_id = u;
  select count(*) into n_identities from auth.identities where user_id = u;
  ok := result = '{"deleted": true}'::jsonb and n_users = 0 and n_entries = 0 and n_identities = 0;
  failed := failed or not ok;
  report := report || format(E'%s [삭제] 응답 %s, 남은 사용자 %s, 기록 %s, identity %s(기대 {"deleted": true}, 0, 0, 0)\n',
    case when ok then 'PASS' else 'FAIL' end, result, n_users, n_entries, n_identities);

  -- ----------------------------------------------------------
  -- 2. 같은 토큰으로 다시 부르기(이미 지운 사용자)
  -- ----------------------------------------------------------
  begin
    set local role authenticated;
    result := public.delete_my_account();
    reset role;
    result := jsonb_build_object('returned', result);
  exception when others then
    reset role;
    result := jsonb_build_object('error', sqlerrm);
  end;
  ok := result = '{"error": "UNAUTHENTICATED"}'::jsonb;
  failed := failed or not ok;
  report := report || format(E'%s [다시 삭제] %s(기대 {"error": "UNAUTHENTICATED"})\n',
    case when ok then 'PASS' else 'FAIL' end, result);

  -- ----------------------------------------------------------
  -- 3. 로그인하지 않은 요청(anon)
  -- ----------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', other, 'role', 'anon')::text, true);
  begin
    set local role anon;
    result := public.delete_my_account();
    reset role;
    result := jsonb_build_object('returned', result);
  exception when others then
    reset role;
    result := jsonb_build_object('sqlstate', sqlstate);
  end;
  ok := result = '{"sqlstate": "42501"}'::jsonb;   -- 42501 = insufficient_privilege(실행 권한 없음)
  failed := failed or not ok;
  report := report || format(E'%s [anon] %s(기대 {"sqlstate": "42501"}, 실행 권한 없음)\n',
    case when ok then 'PASS' else 'FAIL' end, result);

  -- ----------------------------------------------------------
  -- 4. 다른 사용자는 그대로
  -- ----------------------------------------------------------
  select count(*) into n_other from public.daily_entries where user_id = other;
  select count(*) into n_users from auth.users where id = other;
  ok := n_other = 1 and n_users = 1;
  failed := failed or not ok;
  report := report || format(E'%s [다른 사용자] 사용자 %s, 기록 %s(기대 1, 1)\n',
    case when ok then 'PASS' else 'FAIL' end, n_users, n_other);

  -- 결과를 보여주고 전부 되돌린다
  raise exception E'%\n%(이 메시지는 결과를 보여주려고 일부러 낸 오류이고, 만든 데이터는 모두 되돌려졌습니다)',
    case when failed then 'FAIL: 아래에서 FAIL 줄을 확인하세요' else 'ALL PASS' end, report;
end $$;
