-- ============================================================
-- 며칠에 걸친 규칙 확인: 연속 일수, 180일 안에 완료한 미션 제외, 14일 안에 넘긴 미션 제외, 2차 규칙
--
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run.
--   · 임시 사용자와 지난 날짜 기록을 만들어 확인한 뒤, 마지막에 일부러 오류를 내서 전부 되돌린다.
--     그래서 결과는 "오류" 메시지로 나오고, DB에는 아무것도 남지 않는다.
--   · 결과 맨 앞이 'ALL PASS'면 통과, 'FAIL'이면 FAIL 줄을 확인한다.
--   · 날짜 계산 기준(경계)
--       완료: 완료한 날을 1일째로 180일 동안 제외 → 179일 전 완료는 제외, 180일 전 완료는 다시 후보
--       넘김: 넘긴 날을 1일째로 14일 동안 제외   → 13일 전 넘김은 제외, 14일 전 넘김은 다시 후보
-- ============================================================
do $$
declare
  u uuid := gen_random_uuid();
  d date := public.kst_day();
  s jsonb;
  picks text[];
  others text[];
  report text := '';
  failed boolean := false;
  ok boolean;          -- 확인 한 건의 통과 여부
begin
  insert into auth.users (id, instance_id, aud, role, email)
  values (u, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          'rule-check-' || u || '@example.com');

  -- ----------------------------------------------------------
  -- 1. 연속 일수
  -- ----------------------------------------------------------
  insert into public.daily_entries (user_id, date, current_mission_id, seen_mission_ids, completed_at, stamp_id) values
    (u, d - 1, 'E010', '{E010}', now(), 'p01'),
    (u, d - 2, 'E011', '{E011}', now(), 'p02'),
    (u, d - 3, 'E012', '{E012}', now(), 'p03'),
    (u, d - 5, 'E013', '{E013}', now(), 'p04');   -- 4일 전이 비어 끊긴다

  s := public.today_state(u, d);
  ok := (s->>'streak')::int = 3 and (s->>'totalCompleted')::int = 4 and s->>'state' = 'not_drawn';
  failed := failed or not ok;
  report := report || format(E'%s [연속] 어제까지 3일 연속(5일 전은 끊김), 오늘은 아직 → streak=%s(기대 3), 누적=%s(기대 4), state=%s(기대 not_drawn)\n',
    case when ok then 'PASS' else 'FAIL' end, s->>'streak', s->>'totalCompleted', s->>'state');

  insert into public.daily_entries (user_id, date, current_mission_id, seen_mission_ids, completed_at, stamp_id)
  values (u, d, 'E014', '{E014}', now(), 'p05');
  s := public.today_state(u, d);
  ok := (s->>'streak')::int = 4 and s->>'state' = 'done';
  failed := failed or not ok;
  report := report || format(E'%s [연속] 오늘도 완료 → streak=%s(기대 4), state=%s(기대 done)\n',
    case when ok then 'PASS' else 'FAIL' end, s->>'streak', s->>'state');

  delete from public.daily_entries where user_id = u;
  insert into public.daily_entries (user_id, date, current_mission_id, seen_mission_ids, completed_at, stamp_id)
  values (u, d - 2, 'E011', '{E011}', now(), 'p02');
  s := public.today_state(u, d);
  ok := (s->>'streak')::int = 0;
  failed := failed or not ok;
  report := report || format(E'%s [연속] 그제만 완료(어제 비어 있음) → streak=%s(기대 0)\n',
    case when ok then 'PASS' else 'FAIL' end, s->>'streak');

  -- 뽑은 뒤 완료하지 않은 오늘은 연속을 끊지 않는다(어제까지의 연속 유지)
  insert into public.daily_entries (user_id, date, current_mission_id, seen_mission_ids, completed_at, stamp_id)
  values (u, d - 1, 'E012', '{E012}', now(), 'p03'),
         (u, d, 'E015', '{E015}', null, null);
  s := public.today_state(u, d);
  ok := (s->>'streak')::int = 2 and s->>'state' = 'challenge';
  failed := failed or not ok;
  report := report || format(E'%s [연속] 그제·어제 완료, 오늘은 뽑기만 → streak=%s(기대 2), state=%s(기대 challenge)\n',
    case when ok then 'PASS' else 'FAIL' end, s->>'streak', s->>'state');
  delete from public.daily_entries where user_id = u;

  -- ----------------------------------------------------------
  -- 2. 180일 안에 완료한 미션 제외
  --    오늘 본 미션(p_seen)에 나머지 미션을 모두 넣어 후보를 E001·E002 두 개로 좁힌 뒤 30번 뽑는다
  -- ----------------------------------------------------------
  insert into public.daily_entries (user_id, date, current_mission_id, seen_mission_ids, completed_at, stamp_id) values
    (u, d - 179, 'E001', '{E001}', now(), 'p01'),
    (u, d - 180, 'E002', '{E002}', now(), 'p02');
  others := array(select id from public.missions where is_active and id not in ('E001', 'E002'));
  picks := array(select distinct public.pick_mission(u, d, others) from generate_series(1, 30) order by 1);
  ok := picks = array['E002'];
  failed := failed or not ok;
  report := report || format(E'%s [180일] 179일 전 완료 E001, 180일 전 완료 E002 → 30번 뽑은 결과 %s(기대 {E002})\n',
    case when ok then 'PASS' else 'FAIL' end, picks);

  -- 2차 규칙: 1차 후보가 하나도 없으면 오늘 본 것만 빼고 가장 오래전에 본 미션
  others := array(select id from public.missions where is_active and id <> 'E001');
  picks := array(select distinct public.pick_mission(u, d, others) from generate_series(1, 10) order by 1);
  ok := picks = array['E001'];
  failed := failed or not ok;
  report := report || format(E'%s [2차 규칙] 남은 후보가 180일 안에 완료한 E001뿐 → %s(기대 {E001}, 비어 있지 않아야 함)\n',
    case when ok then 'PASS' else 'FAIL' end, picks);
  delete from public.daily_entries where user_id = u;

  -- ----------------------------------------------------------
  -- 3. 14일 안에 넘긴 미션 제외 (그날 완료한 미션은 넘긴 것으로 치지 않는다)
  --    각 날짜에 미션 두 개를 보고(넘김 + 그날의 마지막 카드), 후보를 E003·E004·E005·E009 네 개로 좁혀 40번 뽑는다
  -- ----------------------------------------------------------
  insert into public.daily_entries (user_id, date, current_mission_id, seen_mission_ids, reroll_count, completed_at, stamp_id) values
    (u, d - 13, 'E006', '{E003,E006}', 1, null, null),       -- E003: 13일 전에 넘김 → 제외
    (u, d - 14, 'E007', '{E004,E007}', 1, null, null),       -- E004: 14일 전에 넘김 → 다시 후보
    (u, d - 15, 'E008', '{E005,E008}', 1, null, null),       -- E005: 15일 전에 넘김 → 후보
    (u, d - 3, 'E009', '{E009}', 0, null, null);             -- E009: 3일 전 마지막 카드, 완료 안 함 → 넘긴 것으로 제외
  others := array(select id from public.missions where is_active and id not in ('E003', 'E004', 'E005', 'E009'));
  picks := array(select distinct public.pick_mission(u, d, others) from generate_series(1, 40) order by 1);
  ok := picks = array['E004', 'E005'];
  failed := failed or not ok;
  report := report || format(E'%s [14일] 13일 전 넘긴 E003, 14일 전 E004, 15일 전 E005, 3일 전 완료 안 한 E009 → 40번 뽑은 결과 %s(기대 {E004,E005})\n',
    case when ok then 'PASS' else 'FAIL' end, picks);

  -- 그날 넘긴 카드와 완료한 카드가 섞인 날: 넘긴 E016은 제외, 완료한 E017은 180일 규칙으로 제외, 아무것도 아닌 E018만 후보
  delete from public.daily_entries where user_id = u;
  insert into public.daily_entries (user_id, date, current_mission_id, seen_mission_ids, reroll_count, completed_at, stamp_id)
  values (u, d - 2, 'E017', '{E016,E017}', 1, now(), 'p06');
  others := array(select id from public.missions where is_active and id not in ('E016', 'E017', 'E018'));
  picks := array(select distinct public.pick_mission(u, d, others) from generate_series(1, 30) order by 1);
  ok := picks = array['E018'];
  failed := failed or not ok;
  report := report || format(E'%s [넘김+완료] 2일 전 E016 넘기고 E017 완료 → 30번 뽑은 결과 %s(기대 {E018})\n',
    case when ok then 'PASS' else 'FAIL' end, picks);

  -- 결과를 보여주고 전부 되돌린다
  raise exception E'%\n%(이 메시지는 결과를 보여주려고 일부러 낸 오류이고, 만든 데이터는 모두 되돌려졌습니다)',
    case when failed then 'FAIL: 아래에서 FAIL 줄을 확인하세요' else 'ALL PASS' end, report;
end $$;
