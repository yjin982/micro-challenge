import "server-only";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { connection } from "next/server";

const TIME_ZONE = "Asia/Seoul";
// DB kst_day()와 같은 자정 1분 유예: 도착 시각에서 1분을 뺀 한국 날짜
const GRACE_MS = 60_000;

// 오늘 날짜(YYYY-MM-DD). 임시 구현이며, /api/today가 생기면 그 응답의 date로 바꾼다.
// 요청마다 계산해야 하므로 빌드 시점 프리렌더링에서 빠진다.
export async function getToday(): Promise<string> {
  await connection();
  return format(new TZDate(Date.now() - GRACE_MS, TIME_ZONE), "yyyy-MM-dd");
}
