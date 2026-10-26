import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// 페이지 요청마다 세션을 확인·갱신하고, 세션 상태에 따라 시작 화면과 앱 화면을 나눈다.
// - 세션 없음: 앱 화면(/, /records, /settings) → /welcome?next=원래 경로
// - 세션 있음(익명·계정): /welcome → /
// - /auth/callback, 없는 주소 등은 그대로 통과
// 실제 권한 확인은 Route Handler와 DB(RLS, security definer 함수)가 맡는다. 여기서는 화면만 나눈다.
const APP_PATHS = ["/", "/records", "/settings"];

export async function proxy(request: NextRequest) {
  const { response, claims, withSessionCookies } = await updateSession(request);
  const { pathname, searchParams } = request.nextUrl;

  if (!claims && APP_PATHS.includes(pathname)) {
    const url = new URL("/welcome", request.url);
    url.searchParams.set("next", pathname + request.nextUrl.search);
    // Supabase가 콜백 대신 Site URL로 오류를 보낸 경우(state 만료 등) 시작 화면에 안내가 뜨게 옮겨 담는다
    const error = searchParams.get("error_code") ?? searchParams.get("error");
    if (error) {
      url.searchParams.set("error", error);
      url.searchParams.set("next", "/");
    }
    return withSessionCookies(NextResponse.redirect(url));
  }

  if (claims && pathname === "/welcome") {
    return withSessionCookies(NextResponse.redirect(new URL("/", request.url)));
  }

  return response;
}

export const config = {
  // API(Route Handler가 세션을 직접 확인·갱신), 정적 파일, 이미지, 메타데이터 파일은 거치지 않는다
  matcher: [
    "/((?!api/|_next/static|_next/image|images/|favicon.ico|icon.png|apple-icon.png|opengraph-image|robots.txt|sitemap.xml|manifest).*)",
  ],
};
