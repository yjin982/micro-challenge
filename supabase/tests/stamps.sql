-- ============================================================
-- 도장 12종·겹치지 않게 찍기 확인: pick_stamp, complete_today의 도장, stamp_id 제약, 권한
--
-- 먼저 supabase/migrations/20261030000000_stamps_12.sql을 실행해 둔다.
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run.
--   · 임시 익명 사용자 셋과 기록을 만들고, 그 사용자로 로그인한 것처럼 함수를 부른다.
--     마지막에 일부러 오류를 내서 전부 되돌린다(entry-note.sql과 같은 방식).
--     그래서 결과는 "오류" 메시지로 나오고, DB에는 아무것도 남지 않는다.
--   · 결과 맨 앞이 'ALL PASS'면 통과, 'FAIL'이면 FAIL 줄을 확인한다.
-- ============================================================
do $$
declare
  u1 uuid := gen_random_uuid();   -- 최근 완료 4번(p01–p04)과 그보다 오래된 p05, 오늘 뽑기만
  u2 uuid := gen_random_uuid();   -- 기록 없음(첫 완료)
  u3 uuid := gen_random_uuid();   -- 며칠 쉬고 온 사용자(완료한 날 사이가 비어 있음)
  d date := public.kst_day();
  r jsonb;
  err text;
  v_stamp text;
  v_seen text[] := '{}';
  i int;
  report text := '';
  failed boolean := false;
  ok boolean;
begin
  insert into auth.users (id, instance_id, aud, role, is_anonymous) values
    (u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true),
    (u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true),
    (u3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true);
  insert into public.daily_entries (user_id, date, current_mission_id, seen_mission_ids, completed_at, stamp_id) values
    (u1, d,      'E001', '{E001}', null,  null),    -- 오늘 뽑기만(완료 전)
    (u1, d - 1,  'E002', '{E002}', now(), 'p01'),
    (u1, d - 2,  'E003', '{E003}', now(), 'p02'),
    (u1, d - 3,  'E004', '{E004}', null,  null),    -- 뽑기만 한 날은 세지 않는다
    (u1, d - 4,  'E005', '{E005}', now(), 'p03'),
    (u1, d - 5,  'E006', '{E006}', now(), 'p04'),
    (u1, d - 6,  'E007', '{E007}', now(), 'p05'),   -- 다섯 번째로 오래된 완료: 다시 나와도 된다
    (u2, d,      'E008', '{E008}', null,  null),
    (u3, d,      'E009', '{E009}', null,  null),
    (u3, d - 10, 'E010', '{E010}', now(), 'p07'),
    (u3, d - 20, 'E011', '{E011}', now(), 'p08');

  -- ----------------------------------------------------------
  -- 1. pick_stamp를 200번: 최근 4개(p01–p04)는 한 번도 안 나오고, 나머지 8개만 나온다
  -- ----------------------------------------------------------
  for i in 1..200 loop
    v_stamp := public.pick_stamp(u1, d);
    if not v_stamp = any (v_seen) then v_seen := v_seen || v_stamp; end if;
  end loop;
  ok := not (v_seen && array['p01','p02','p03','p04'])
        and (select count(*) from unnest(v_seen)) = 8;
  failed := failed or not ok;
  report := report || format(E'%s [최근 4개 제외] 나온 도장=%s(기대 p05–p12 8종, p01–p04 없음)\n',
    case when ok then 'PASS' else 'FAIL' end, (select string_agg(s, ',' order by s) from unnest(v_seen) s));

  -- ----------------------------------------------------------
  -- 2. 쉬고 온 사용자: 날짜가 멀어도 최근 완료(p07, p08)는 빠진다
  -- ----------------------------------------------------------
  v_seen := '{}';
  for i in 1..200 loop
    v_stamp := public.pick_stamp(u3, d);
    if not v_stamp = any (v_seen) then v_seen := v_seen || v_stamp; end if;
  end loop;
  ok := not (v_seen && array['p07','p08']) and (select count(*) from unnest(v_seen)) = 10;
  failed := failed or not ok;
  report := report || format(E'%s [쉬고 온 사용자] %s종, p07·p08 포함=%s(기대 10종, false)\n',
    case when ok then 'PASS' else 'FAIL' end, (select count(*) from unnest(v_seen)), v_seen && array['p07','p08']);

  -- ----------------------------------------------------------
  -- 3. complete_today로 완료하면 p01–p04가 아닌 도장이 찍힌다
  -- ----------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    r := public.complete_today(d);
    reset role;
  exception when others then
    reset role;
    r := jsonb_build_object('error', sqlerrm);
  end;
  select stamp_id into v_stamp from public.daily_entries where user_id = u1 and date = d;
  ok := r ->> 'state' = 'done' and r ->> 'stampId' = v_stamp
        and v_stamp in ('p05','p06','p07','p08','p09','p10','p11','p12');
  failed := failed or not ok;
  report := report || format(E'%s [완료 도장] state=%s, 도장=%s(기대 done, p05–p12)\n',
    case when ok then 'PASS' else 'FAIL' end, coalesce(r ->> 'state', r ->> 'error'), v_stamp);

  -- ----------------------------------------------------------
  -- 4. 첫 완료(기록 없음)도 도장이 찍힌다
  -- ----------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    r := public.complete_today(d, '첫 도장');
    reset role;
  exception when others then
    reset role;
    r := jsonb_build_object('error', sqlerrm);
  end;
  ok := r ->> 'state' = 'done' and r ->> 'stampId' ~ '^p(0[1-9]|1[0-2])$' and r ->> 'note' = '첫 도장';
  failed := failed or not ok;
  report := report || format(E'%s [첫 완료] state=%s, 도장=%s, note=%s(기대 done, p01–p12, "첫 도장")\n',
    case when ok then 'PASS' else 'FAIL' end, coalesce(r ->> 'state', r ->> 'error'), r ->> 'stampId', r ->> 'note');

  -- ----------------------------------------------------------
  -- 5. 제약: p12는 들어가고 p13은 막힌다
  -- ----------------------------------------------------------
  begin
    update public.daily_entries set stamp_id = 'p12' where user_id = u3 and date = d - 10;
    err := 'ok';
  exception when others then
    err := sqlstate;
  end;
  ok := err = 'ok';
  failed := failed or not ok;
  report := report || format(E'%s [제약 p12] %s(기대 ok)\n', case when ok then 'PASS' else 'FAIL' end, err);

  begin
    update public.daily_entries set stamp_id = 'p13' where user_id = u3 and date = d - 10;
    err := 'ok';
  exception when others then
    err := sqlstate;
  end;
  ok := err = '23514';
  failed := failed or not ok;
  report := report || format(E'%s [제약 p13] %s(기대 23514)\n', case when ok then 'PASS' else 'FAIL' end, err);

  -- ----------------------------------------------------------
  -- 6. 권한: 사용자는 pick_stamp를 직접 부를 수 없다
  -- ----------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', u3, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    v_stamp := public.pick_stamp(u3, d);
    reset role;
    err := 'returned';
  exception when others then
    reset role;
    err := sqlstate;
  end;
  ok := err = '42501';
  failed := failed or not ok;
  report := report || format(E'%s [authenticated pick_stamp] %s(기대 42501, 내부용)\n', case when ok then 'PASS' else 'FAIL' end, err);

  -- 결과를 보여주고 전부 되돌린다
  raise exception E'%\n%(이 메시지는 결과를 보여주려고 일부러 낸 오류이고, 만든 데이터는 모두 되돌려졌습니다)',
    case when failed then 'FAIL: 아래에서 FAIL 줄을 확인하세요' else 'ALL PASS' end, report;
end $$;
