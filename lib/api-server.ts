import "server-only";
import { NextResponse } from "next/server";
import { NO_STORE, toErrorResponse } from "@/lib/api-error";
import { createClient } from "@/lib/supabase/server";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Route Handler 공통 순서: 세션 확인 → DB 함수(RPC) 호출 → 결과 또는 에러 코드 응답.
// 본인 확인과 규칙 검사는 DB 함수가 auth.uid()로 다시 하므로, 여기서는 세션 갱신과 빠른 거절만 맡는다.
export async function handleRpc(fn: string, args?: Record<string, unknown>) {
  const supabase = await createClient();

  // 응답을 만들기 전에 불러야 만료된 토큰이 갱신되고 새 쿠키가 응답에 실린다.
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth) return toErrorResponse("UNAUTHENTICATED");

  const { data, error } = await supabase.rpc(fn, args);
  if (error) return toErrorResponse(error.message);
  return NextResponse.json(data, { headers: NO_STORE });
}

// 뽑기·재뽑기·완료 요청 본문의 { date: "YYYY-MM-DD" }. 형식이 틀리면 null
export async function readDate(request: Request): Promise<string | null> {
  const body: unknown = await request.json().catch(() => null);
  const date = body && typeof body === "object" && "date" in body ? body.date : null;
  return typeof date === "string" && DATE_PATTERN.test(date) ? date : null;
}
