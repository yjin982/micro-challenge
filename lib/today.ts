import "server-only";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { connection } from "next/server";

const TIME_ZONE = "Asia/Seoul";
// DB kst_day()와 같은 자정 1분 유예: 도착 시각에서 1분을 뺀 한국 날짜
const GRACE_MS = 60_000;

// 서버 컴포넌트가 페이지를 그릴 때 쓰는 오늘 날짜(YYYY-MM-DD): 헤더 날짜, 달력의 달, 공휴일 조회.
// 기준은 /api/today의 date(DB kst_day())다. 화면이 API 날짜를 받아 이 값과 다르면(자정 무렵, 서버 시계 차이)
// lib/useDaySync.ts의 useServerDateSync가 페이지를 새로 그려 맞춘다.
// 요청마다 계산해야 하므로 빌드 시점 프리렌더링에서 빠진다.
export async function getToday(): Promise<string> {
  await connection();
  return format(new TZDate(Date.now() - GRACE_MS, TIME_ZONE), "yyyy-MM-dd");
}
