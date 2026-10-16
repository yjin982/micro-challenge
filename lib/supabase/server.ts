import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Route Handler·서버 컴포넌트용 Supabase 클라이언트. 요청마다 새로 만든다(세션 쿠키가 요청마다 다르다).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // 토큰이 갱신되면 새 세션 쿠키를 응답에 쓴다. 서버 컴포넌트에서는 쿠키를 쓸 수 없어 무시한다.
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // 서버 컴포넌트에서 부른 경우. 갱신은 다음 Route Handler 요청이나 브라우저 클라이언트가 맡는다.
        }
      },
    },
  });
}
