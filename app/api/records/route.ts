import type { NextRequest } from "next/server";
import { toErrorResponse } from "@/lib/api-error";
import { handleRpc } from "@/lib/api-server";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// 한 달치 완료 기록. ?month=YYYY-MM을 그 달 1일로 바꿔 넘긴다.
export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");
  if (!month || !MONTH_PATTERN.test(month)) return toErrorResponse("INVALID_INPUT");
  return handleRpc("get_month", { p_month: `${month}-01` });
}
