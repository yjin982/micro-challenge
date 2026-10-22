import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

// proxy.ts용 Supabase 세션 확인. 요청 쿠키로 세션을 읽고, 토큰이 만료됐으면 갱신해서 새 쿠키를
// 요청(이어지는 서버 컴포넌트·Route Handler가 읽는다)과 응답(브라우저에 저장된다) 양쪽에 싣는다.
// 반환한 response를 그대로 돌려주거나, 리다이렉트할 때는 withSessionCookies로 쿠키를 옮겨 담아야 갱신된 세션을 잃지 않는다.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  // 쿠키를 쓸 때 Supabase가 넘겨주는 캐시 금지 헤더(세션 쿠키가 담긴 응답을 CDN이 캐시하지 않게)
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
          cacheHeaders = headers;
          for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
        },
      },
    },
  );

  // 세션 확인과 토큰 갱신. 세션이 없거나 쓸 수 없으면 claims는 null이다.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  // 리다이렉트 응답에 갱신된 세션 쿠키와 캐시 금지 헤더를 옮겨 담는다
  function withSessionCookies(redirect: NextResponse) {
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    for (const [key, value] of Object.entries(cacheHeaders)) redirect.headers.set(key, value);
    return redirect;
  }

  return { response, claims, withSessionCookies };
}
