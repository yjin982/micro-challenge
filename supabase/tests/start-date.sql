-- ============================================================
-- 시작한 날 확인: get_month의 startDate, firstMonth(첫 기록 달과 시작한 달 중 이른 달)
--
-- 먼저 supabase/migrations/20261030020000_start_date.sql을 실행해 둔다.
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run.
--   · 임시 익명 사용자를 만들고(계정 만든 때를 과거로) 그 사용자로 로그인한 것처럼 get_month를 부른다.
--     마지막에 일부러 오류를 내서 전부 되돌린다(entry-note.sql과 같은 방식).
--   · 결과 맨 앞이 'ALL PASS'면 통과, 'FAIL'이면 FAIL 줄을 확인한다.
-- ============================================================
do $$
declare
  u1 uuid := gen_random_uuid();   -- 40일 전에 만들고 10일 전에 처음 뽑음 → firstMonth는 시작한 달
  u2 uuid := gen_random_uuid();   -- 오늘 만들고 기록 없음 → firstMonth는 이번 달
  d date := public.kst_day();
  start1 date := public.kst_day(now() - interval '40 days');
  r jsonb;
  report text := '';
  failed boolean := false;
  ok boolean;
begin
  insert into auth.users (id, instance_id, aud, role, is_anonymous, created_at) values
    (u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true, now() - interval '40 days'),
    (u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true, now());
  insert into public.daily_entries (user_id, date, current_mission_id, seen_mission_ids, completed_at, stamp_id) values
    (u1, d - 10, 'E001', '{E001}', now(), 'p01');

  -- 1. 시작한 날과 시작한 달
  perform set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    r := public.get_month(date_trunc('month', start1)::date);
    reset role;
  exception when others then
    reset role;
    r := jsonb_build_object('error', sqlerrm);
  end;
  ok := r ->> 'startDate' = start1::text and r ->> 'firstMonth' = to_char(start1, 'YYYY-MM');
  failed := failed or not ok;
  report := report || format(E'%s [시작한 날] startDate=%s, firstMonth=%s(기대 %s, %s)\n',
    case when ok then 'PASS' else 'FAIL' end, coalesce(r ->> 'startDate', r ->> 'error'), r ->> 'firstMonth',
    start1, to_char(start1, 'YYYY-MM'));

  -- 2. 기록이 없어도 시작한 달이 firstMonth
  perform set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    r := public.get_month(date_trunc('month', d)::date);
    reset role;
  exception when others then
    reset role;
    r := jsonb_build_object('error', sqlerrm);
  end;
  ok := r ->> 'startDate' = d::text and r ->> 'firstMonth' = to_char(d, 'YYYY-MM') and r -> 'days' = '[]'::jsonb;
  failed := failed or not ok;
  report := report || format(E'%s [기록 없음] startDate=%s, firstMonth=%s(기대 %s, %s)\n',
    case when ok then 'PASS' else 'FAIL' end, coalesce(r ->> 'startDate', r ->> 'error'), r ->> 'firstMonth',
    d, to_char(d, 'YYYY-MM'));

  -- 결과를 보여주고 전부 되돌린다
  raise exception E'%\n%(이 메시지는 결과를 보여주려고 일부러 낸 오류이고, 만든 데이터는 모두 되돌려졌습니다)',
    case when failed then 'FAIL: 아래에서 FAIL 줄을 확인하세요' else 'ALL PASS' end, report;
end $$;
