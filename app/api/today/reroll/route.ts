import { toErrorResponse } from "@/lib/api-error";
import { handleRpc, readDate } from "@/lib/api-server";

// 재뽑기(하루 3번). 본문 { date }는 화면이 GET /api/today에서 받은 날짜다.
export async function POST(request: Request) {
  const date = await readDate(request);
  if (!date) return toErrorResponse("INVALID_INPUT");
  return handleRpc("reroll_today", { p_date: date });
}
