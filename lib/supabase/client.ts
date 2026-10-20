import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// 브라우저용 Supabase 클라이언트. 브라우저에서는 한 개만 만들어 재사용한다(createBrowserClient 기본 동작).
// NEXT_PUBLIC_ 값은 빌드 때 코드에 박히므로 process.env.이름을 그대로 써야 한다.
export function createClient() {
  return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!);
}
