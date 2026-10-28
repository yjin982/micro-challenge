import "server-only";
import { NextResponse } from "next/server";
import { NO_STORE, toErrorResponse } from "@/lib/api-error";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type Functions = Database["public"]["Functions"];
// API가 부르는 DB 함수(내부용 pick_mission·today_state·kst_day는 사용자 권한으로 부를 수 없다)
type ApiFunction =
  | "get_today"
  | "draw_first"
  | "reroll_today"
  | "complete_today"
  | "get_month"
  | "delete_my_account"
  | "set_note";

// Route Handler 공통 순서: 세션 확인 → DB 함수(RPC) 호출 → 결과 또는 에러 코드 응답.
// 본인 확인과 규칙 검사는 DB 함수가 auth.uid()로 다시 하므로, 여기서는 세션 갱신과 빠른 거절만 맡는다.
// 함수 이름과 인자는 types/database.ts로 검사한다. 응답은 DB 함수가 만든 JSON 그대로이고, 모양은 types/api.ts에 있다.
export async function handleRpc<F extends ApiFunction>(fn: F, args?: Functions[F]["Args"]) {
  const supabase = await createClient();

  // 응답을 만들기 전에 불러야 만료된 토큰이 갱신되고 새 쿠키가 응답에 실린다.
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth) return toErrorResponse("UNAUTHENTICATED");

  const { data, error } = await supabase.rpc(fn, args);
  // 지워진 사용자의 토큰(만료 전)으로 기록을 쓰면 daily_entries.user_id 외래 키에 걸린다. 오류 화면(500) 대신
  // 세션 없음(401)으로 돌려줘 화면이 쿠키를 지우고 시작 화면으로 가게 한다(화면의 사용자 확인을 지나친 요청의 안전장치)
  if (error?.code === "23503" && error.message.includes("daily_entries_user_id_fkey")) {
    return toErrorResponse("UNAUTHENTICATED");
  }
  if (error) return toErrorResponse(error.message);
  return NextResponse.json(data, { headers: NO_STORE });
}

// 뽑기·재뽑기·완료 요청 본문의 { date: "YYYY-MM-DD" }. 형식이 틀리면 null
export async function readDate(request: Request): Promise<string | null> {
  return (await readDateAndNote(request))?.date ?? null;
}

// 메모가 함께 오는 요청 본문 { date, note? }(완료, 메모 고치기). note는 글자, null(지우기), 없음(undefined)만 받는다.
// 글자 수 상한과 정리(줄바꿈·공백)는 DB 함수(clean_note, 100자)가 맡는다. 여기서는 정리 전 글이 지나치게 길면
// DB까지 보내지 않고 거절한다(공백을 지우면 상한 안이 될 수 있어 넉넉하게 2,000자).
const NOTE_RAW_LIMIT = 2000;

export async function readDateAndNote(
  request: Request,
): Promise<{ date: string; note: string | null | undefined } | null> {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return null;
  const date = "date" in body ? body.date : null;
  const note = "note" in body ? body.note : undefined;
  if (typeof date !== "string" || !DATE_PATTERN.test(date)) return null;
  if (note !== undefined && note !== null && (typeof note !== "string" || note.length > NOTE_RAW_LIMIT)) return null;
  return { date, note };
}
