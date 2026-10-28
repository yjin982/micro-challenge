import { toErrorResponse } from "@/lib/api-error";
import { handleRpc, readDateAndNote } from "@/lib/api-server";

// 완료, 도장 결정. 본문 { date, note? }: date는 화면이 GET /api/today에서 받은 날짜, note는 완료 메모(비워도 된다).
export async function POST(request: Request) {
  const body = await readDateAndNote(request);
  if (!body) return toErrorResponse("INVALID_INPUT");
  return handleRpc("complete_today", { p_date: body.date, ...(body.note ? { p_note: body.note } : {}) });
}
