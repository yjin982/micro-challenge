-- ============================================================
-- 계정 삭제(로그인 개편 4C단계): delete_my_account()
--
-- 실행: Supabase SQL Editor에 통째로 붙여 넣고 Run. 다시 실행해도 덮어쓴다.
-- 확인: supabase/tests/delete-account.sql
-- ============================================================

-- ------------------------------------------------------------
-- delete_my_account(): 지금 로그인한 사용자(Google·익명 모두)를 지운다
--   돌려주는 값: { "deleted": true }
--
--   · auth.users 한 줄을 지우면 함께 지워진다
--       - public.daily_entries: user_id가 on delete cascade(1번 SQL)
--       - auth.identities, auth.sessions, auth.refresh_tokens: Supabase Auth 쪽 cascade
--   · security definer라 함수를 만든 postgres 권한으로 auth.users를 지운다.
--     지우는 대상은 auth.uid()(요청한 사용자의 토큰)로만 정해서 남의 계정은 지울 수 없다.
--   · 이미 지워진 사용자의 토큰(만료 전)으로 부르면 지울 줄이 없어 UNAUTHENTICATED(401).
--     화면은 401을 받으면 쿠키를 지우고 시작 화면으로 간다.
--   · Google 쪽 연결(서드파티 앱 목록)은 끊지 않는다(기본안). 끊는 방법은 로그인 계획 4C단계
-- ------------------------------------------------------------
create or replace function public.delete_my_account()
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  delete from auth.users where id = v_uid;
  if not found then raise exception 'UNAUTHENTICATED'; end if;
  return jsonb_build_object('deleted', true);
end;
$$;

-- 실행 권한: 로그인한 사용자(익명 포함)만. 1번 SQL의 6. 실행 권한과 같은 방식
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
