import { formatDayLabel } from "@/lib/date";
import { getToday } from "@/lib/today";

// 헤더의 오늘 날짜. 요청 시점 데이터라 레이아웃 전체가 기다리지 않도록 <Suspense> 안에서 쓴다.
export async function TodayLabel() {
  const today = await getToday();
  return formatDayLabel(today);
}
