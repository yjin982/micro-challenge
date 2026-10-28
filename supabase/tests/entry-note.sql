-- ============================================================
-- 완료 메모 확인: complete_today(메모), set_note, today_state·get_month의 note, 제약, 권한
-- 상한은 100자(20261028010000_entry_note_100.sql). 경계값 100/101을 본다
--
-- 먼저 supabase/migrations/20261028000000_entry_note.sql을 실행해 둔다.
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run.
--   · 임시 익명 사용자 셋과 기록을 만들고, 그 사용자로 로그인한 것처럼 함수를 부른다.
--     마지막에 일부러 오류를 내서 전부 되돌린다(draw-rules.sql, delete-account.sql과 같은 방식).
--     그래서 결과는 "오류" 메시지로 나오고, DB에는 아무것도 남지 않는다.
--   · 결과 맨 앞이 'ALL PASS'면 통과, 'FAIL'이면 FAIL 줄을 확인한다.
-- ============================================================
do $$
declare
  u1 uuid := gen_random_uuid();   -- 메모와 함께 완료, 지난 날 메모 고치기
  u2 uuid := gen_random_uuid();   -- 메모 없이 예전 방식으로 완료, 다른 사람 행
  u3 uuid := gen_random_uuid();   -- 101자 메모로 완료 시도
  d date := public.kst_day();
  r jsonb;
  err text;
  v_note text;
  v_at timestamptz;
  v_done timestamptz;
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
    (u1, d - 1,  'E002', '{E002}', now(), 'p01'),   -- 어제 완료
    (u1, d - 2,  'E003', '{E003}', null,  null),    -- 그저께 뽑기만(완료 안 함)
    (u2, d,      'E004', '{E004}', null,  null),
    (u2, d - 5,  'E005', '{E005}', now(), 'p02'),   -- u2만 가진 날
    (u3, d,      'E006', '{E006}', null,  null);

  -- ----------------------------------------------------------
  -- 1. 메모와 함께 완료(줄바꿈·앞뒤 공백 정리), today_state에 note
  -- ----------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    r := public.complete_today(d, E'  첫 줄\n둘째   줄\t ');
    reset role;
  exception when others then
    reset role;
    r := jsonb_build_object('error', sqlerrm);
  end;
  select note, note_updated_at, completed_at into v_note, v_at, v_done from public.daily_entries where user_id = u1 and date = d;
  ok := r ->> 'state' = 'done' and r ->> 'note' = '첫 줄 둘째 줄' and v_note = '첫 줄 둘째 줄'
        and v_at is not null and v_done is not null;
  failed := failed or not ok;
  report := report || format(E'%s [메모와 함께 완료] state=%s, 응답 note=%s, 저장 note=%s(기대 done, "첫 줄 둘째 줄")\n',
    case when ok then 'PASS' else 'FAIL' end, r ->> 'state', r ->> 'note', v_note);

  -- ----------------------------------------------------------
  -- 2. 메모 없이 예전 방식(complete_today(날짜))으로 완료
  -- ----------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', u2, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    r := public.complete_today(d);
    reset role;
  exception when others then
    reset role;
    r := jsonb_build_object('error', sqlerrm);
  end;
  select note, note_updated_at into v_note, v_at from public.daily_entries where user_id = u2 and date = d;
  ok := r ->> 'state' = 'done' and v_note is null and v_at is null and (r -> 'note') = 'null'::jsonb;
  failed := failed or not ok;
  report := report || format(E'%s [메모 없이 완료] state=%s, note=%s(기대 done, null)\n',
    case when ok then 'PASS' else 'FAIL' end, r ->> 'state', coalesce(v_note, 'null'));

  -- ----------------------------------------------------------
  -- 3. 101자 메모로 완료 → INVALID_INPUT, 완료도 되지 않음
  -- ----------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', u3, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    r := public.complete_today(d, repeat('가', 101));
    reset role;
    err := 'returned';
  exception when others then
    reset role;
    err := sqlerrm;
  end;
  select completed_at into v_done from public.daily_entries where user_id = u3 and date = d;
  ok := err = 'INVALID_INPUT' and v_done is null;
  failed := failed or not ok;
  report := report || format(E'%s [101자로 완료] %s, 완료됨=%s(기대 INVALID_INPUT, false)\n',
    case when ok then 'PASS' else 'FAIL' end, err, v_done is not null);

  -- ----------------------------------------------------------
  -- 4. set_note: 지난 완료 날 쓰기 → 100자 통과 → 101자 거절 → 공백만이면 삭제
  -- ----------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    r := public.set_note(d - 1, '  나중에 쓴 메모  ');
    reset role;
  exception when others then
    reset role;
    r := jsonb_build_object('error', sqlerrm);
  end;
  ok := r ->> 'note' = '나중에 쓴 메모' and r ->> 'noteUpdatedAt' is not null and r ->> 'date' = (d - 1)::text;
  failed := failed or not ok;
  report := report || format(E'%s [지난 날 쓰기] %s(기대 note "나중에 쓴 메모", noteUpdatedAt 있음)\n',
    case when ok then 'PASS' else 'FAIL' end, r);

  begin
    set local role authenticated;
    r := public.set_note(d - 1, repeat('가', 100));
    reset role;
    err := 'ok';
  exception when others then
    reset role;
    err := sqlerrm;
  end;
  select note into v_note from public.daily_entries where user_id = u1 and date = d - 1;
  ok := err = 'ok' and char_length(v_note) = 100;
  failed := failed or not ok;
  report := report || format(E'%s [100자] %s, 저장 길이 %s(기대 ok, 100)\n',
    case when ok then 'PASS' else 'FAIL' end, err, char_length(v_note));

  begin
    set local role authenticated;
    r := public.set_note(d - 1, repeat('가', 101));
    reset role;
    err := 'returned';
  exception when others then
    reset role;
    err := sqlerrm;
  end;
  select note into v_note from public.daily_entries where user_id = u1 and date = d - 1;
  ok := err = 'INVALID_INPUT' and char_length(v_note) = 100;
  failed := failed or not ok;
  report := report || format(E'%s [101자] %s, 그대로 남은 길이 %s(기대 INVALID_INPUT, 100)\n',
    case when ok then 'PASS' else 'FAIL' end, err, char_length(v_note));

  begin
    set local role authenticated;
    r := public.set_note(d - 1, E'   \n  ');
    reset role;
  exception when others then
    reset role;
    r := jsonb_build_object('error', sqlerrm);
  end;
  select note, note_updated_at, completed_at into v_note, v_at, v_done from public.daily_entries where user_id = u1 and date = d - 1;
  ok := (r -> 'note') = 'null'::jsonb and v_note is null and v_at is null and v_done is not null;
  failed := failed or not ok;
  report := report || format(E'%s [공백만이면 삭제] note=%s, 완료는 그대로=%s(기대 null, true)\n',
    case when ok then 'PASS' else 'FAIL' end, coalesce(v_note, 'null'), v_done is not null);

  -- ----------------------------------------------------------
  -- 5. set_note: 완료 전 날·없는 날·다른 사람 날은 NOT_FOUND
  -- ----------------------------------------------------------
  begin
    set local role authenticated;
    r := public.set_note(d - 2, '안 됨');
    reset role;
    err := 'returned';
  exception when others then
    reset role;
    err := sqlerrm;
  end;
  ok := err = 'NOT_FOUND';
  failed := failed or not ok;
  report := report || format(E'%s [완료 전 날] %s(기대 NOT_FOUND)\n', case when ok then 'PASS' else 'FAIL' end, err);

  begin
    set local role authenticated;
    r := public.set_note(d - 30, '안 됨');
    reset role;
    err := 'returned';
  exception when others then
    reset role;
    err := sqlerrm;
  end;
  ok := err = 'NOT_FOUND';
  failed := failed or not ok;
  report := report || format(E'%s [없는 날] %s(기대 NOT_FOUND)\n', case when ok then 'PASS' else 'FAIL' end, err);

  begin
    set local role authenticated;
    r := public.set_note(d - 5, '남의 날');   -- u1로 로그인한 채 u2만 가진 날
    reset role;
    err := 'returned';
  exception when others then
    reset role;
    err := sqlerrm;
  end;
  select note into v_note from public.daily_entries where user_id = u2 and date = d - 5;
  ok := err = 'NOT_FOUND' and v_note is null;
  failed := failed or not ok;
  report := report || format(E'%s [다른 사람 날] %s, u2 메모=%s(기대 NOT_FOUND, null)\n',
    case when ok then 'PASS' else 'FAIL' end, err, coalesce(v_note, 'null'));

  -- ----------------------------------------------------------
  -- 6. get_month: 이번 달 days[]에 note
  -- ----------------------------------------------------------
  begin
    set local role authenticated;
    r := public.get_month(date_trunc('month', d)::date);
    reset role;
  exception when others then
    reset role;
    r := jsonb_build_object('error', sqlerrm);
  end;
  ok := exists (select 1 from jsonb_array_elements(r -> 'days') x
                where x ->> 'date' = d::text and x ->> 'note' = '첫 줄 둘째 줄');
  failed := failed or not ok;
  report := report || format(E'%s [get_month] 오늘 note 포함=%s(기대 true)\n', case when ok then 'PASS' else 'FAIL' end, ok);

  -- ----------------------------------------------------------
  -- 7. 제약: 완료 전 행에 메모, 줄바꿈 메모, 빈 문자열 메모는 직접 넣어도 막힌다
  -- ----------------------------------------------------------
  begin
    update public.daily_entries set note = '완료 전' where user_id = u1 and date = d - 2;
    err := 'updated';
  exception when check_violation then
    err := 'check_violation';
  end;
  ok := err = 'check_violation';
  failed := failed or not ok;
  report := report || format(E'%s [제약: 완료 전 메모] %s(기대 check_violation)\n', case when ok then 'PASS' else 'FAIL' end, err);

  begin
    update public.daily_entries set note = E'a\nb' where user_id = u2 and date = d - 5;
    err := 'updated';
  exception when check_violation then
    err := 'check_violation';
  end;
  ok := err = 'check_violation';
  failed := failed or not ok;
  report := report || format(E'%s [제약: 줄바꿈] %s(기대 check_violation)\n', case when ok then 'PASS' else 'FAIL' end, err);

  begin
    update public.daily_entries set note = '' where user_id = u2 and date = d - 5;
    err := 'updated';
  exception when check_violation then
    err := 'check_violation';
  end;
  ok := err = 'check_violation';
  failed := failed or not ok;
  report := report || format(E'%s [제약: 빈 문자열] %s(기대 check_violation)\n', case when ok then 'PASS' else 'FAIL' end, err);

  -- ----------------------------------------------------------
  -- 8. 권한: 로그인하지 않은 요청(anon)은 set_note·complete_today를, 사용자는 clean_note를 부를 수 없다
  -- ----------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'anon')::text, true);
  begin
    set local role anon;
    r := public.set_note(d - 1, 'x');
    reset role;
    err := 'returned';
  exception when others then
    reset role;
    err := sqlstate;
  end;
  ok := err = '42501';
  failed := failed or not ok;
  report := report || format(E'%s [anon set_note] %s(기대 42501)\n', case when ok then 'PASS' else 'FAIL' end, err);

  begin
    set local role anon;
    r := public.complete_today(d, 'x');
    reset role;
    err := 'returned';
  exception when others then
    reset role;
    err := sqlstate;
  end;
  ok := err = '42501';
  failed := failed or not ok;
  report := report || format(E'%s [anon complete_today] %s(기대 42501)\n', case when ok then 'PASS' else 'FAIL' end, err);

  perform set_config('request.jwt.claims', json_build_object('sub', u1, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    v_note := public.clean_note('x');
    reset role;
    err := 'returned';
  exception when others then
    reset role;
    err := sqlstate;
  end;
  ok := err = '42501';
  failed := failed or not ok;
  report := report || format(E'%s [authenticated clean_note] %s(기대 42501, 내부용)\n', case when ok then 'PASS' else 'FAIL' end, err);

  -- 결과를 보여주고 전부 되돌린다
  raise exception E'%\n%(이 메시지는 결과를 보여주려고 일부러 낸 오류이고, 만든 데이터는 모두 되돌려졌습니다)',
    case when failed then 'FAIL: 아래에서 FAIL 줄을 확인하세요' else 'ALL PASS' end, report;
end $$;
