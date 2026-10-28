import { toErrorResponse } from "@/lib/api-error";
import { handleRpc, readDateAndNote } from "@/lib/api-server";

// 완료한 날의 메모 쓰기·고치기·지우기. 본문 { date, note }: note가 null이거나 비면 지운다.
// 고칠 수 있는 것은 메모뿐이고, 그날 완료한 기록이 없으면 NOT_FOUND(404). 응답 { date, note, noteUpdatedAt }
export async function PATCH(request: Request) {
  const body = await readDateAndNote(request);
  if (!body || body.note === undefined) return toErrorResponse("INVALID_INPUT");
  // set_note는 메모 인자를 꼭 받는다. 지울 때는 빈 글을 보내면 DB(clean_note)가 null로 바꿔 지운다
  return handleRpc("set_note", { p_date: body.date, p_note: body.note ?? "" });
}
