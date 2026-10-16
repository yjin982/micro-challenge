import { handleRpc } from "@/lib/api-server";

// 오늘 상태, 연속·누적 수, 최근 기록 3개
export async function GET() {
  return handleRpc("get_today");
}
