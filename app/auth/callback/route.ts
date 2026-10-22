import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google 로그인·연결(linkIdentity)이 돌아오는 곳. 성공하면 code를 세션으로 바꿔 next로 보낸다.
// 실패하면 Supabase가 redirectTo의 쿼리(next)를 그대로 두고 error·error_code를 붙여 보낸다(code 없음).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  // 다른 사이트로 보내지 않도록 같은 사이트의 상대 경로만 받는다
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  const supabase = await createClient();

  let reason = searchParams.get("error_code") ?? searchParams.get("error");
  if (code && !reason) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
    reason = error.code ?? "auth_failed";
  }
  reason ??= "auth_failed";

  // 세션이 남아 있으면(익명 사용자의 연결·전환 실패) 하던 화면으로 돌아가 안내한다.
  // /welcome으로 보내면 proxy가 세션 있는 사용자를 /로 돌려보내며 오류가 사라진다.
  const { data } = await supabase.auth.getClaims();
  const url = new URL(data ? next : "/welcome", origin);
  if (data) {
    url.searchParams.set("auth_error", reason);
  } else {
    url.searchParams.set("error", reason);
    url.searchParams.set("next", next);
  }
  return NextResponse.redirect(url);
}
