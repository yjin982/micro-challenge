import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { NO_STORE } from "@/lib/api-error";
import type { ApiErrorBody } from "@/types/api";

// Supabase 무료 프로젝트는 7일 동안 요청이 없으면 일시 중지된다. Vercel Cron(vercel.json)이 하루 한 번 불러
// 미션 한 줄을 읽어 두어 프로젝트를 깨워 둔다. 화면에서는 쓰지 않는다.
// missions는 로그인 없이 읽을 수 있는 테이블이라 세션 없이 publishable 키로 읽는다.
// Vercel은 환경변수 CRON_SECRET을 "Authorization: Bearer <값>"으로 실어 보내므로, 같은 값일 때만 처리한다.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json<ApiErrorBody>(
      { error: { code: "UNAUTHENTICATED", message: "로그인이 필요해요." } },
      { status: 401, headers: NO_STORE },
    );
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.from("missions").select("id").limit(1);
  if (error) {
    console.error("[cron] Supabase 조회 실패", error);
    return NextResponse.json<ApiErrorBody>(
      { error: { code: "INTERNAL", message: "잠시 후 다시 시도해 주세요." } },
      { status: 500, headers: NO_STORE },
    );
  }

  return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() }, { headers: NO_STORE });
}
