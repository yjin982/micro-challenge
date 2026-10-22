import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

// Google 로그인·연결(linkIdentity)이 돌아오는 곳. 성공하면 code를 세션으로 바꿔 next로 보낸다.
// 실패하면 Supabase가 redirectTo의 쿼리(next)를 그대로 두고 error·error_code를 붙여 보낸다(code 없음).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = requestOrigin(request);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
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

// 사용자가 들어온 주소. Route Handler의 request.url·nextUrl은 dev 서버가 뜬 호스트(localhost)라서
// 다른 주소(휴대폰에서 192.168.x.x:3000 등)로 들어와도 localhost로 보내 버린다. 그래서 요청 헤더로 만든다.
// Vercel처럼 프록시 뒤에서는 x-forwarded-host가 원래 호스트다(Supabase 공식 Next.js 예제와 같은 방식).
function requestOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return request.nextUrl.origin;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return `${proto}://${host}`;
}
