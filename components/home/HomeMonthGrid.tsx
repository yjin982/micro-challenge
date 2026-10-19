"use client";

import { useEffect, useState } from "react";
import { MonthGrid } from "@/components/records/MonthGrid";
import { api } from "@/lib/api";
import type { Holidays } from "@/lib/holidays";
import type { StampId } from "@/types/api";
import { useToday } from "./TodayProvider";

// 홈 데스크톱 달력. 이번 달 완료 기록(GET /api/records)을 불러와 완료한 날에 작은 도장을 찍는다.
// 오늘 도장은 오늘 상태(TodayProvider)에서도 가져와, 홈에서 완료하면 다시 불러오지 않아도 바로 찍힌다.
export function HomeMonthGrid({ month, today, holidays }: { month: string; today: string; holidays: Holidays }) {
  const todayState = useToday();
  const [stamps, setStamps] = useState<Record<string, StampId>>({});

  useEffect(() => {
    let active = true;
    api
      .getMonth(month.slice(0, 7))
      .then(({ days }) => {
        if (active) setStamps(Object.fromEntries(days.map((d) => [d.date, d.stampId])));
      })
      // 도장은 꾸밈이라 실패해도 달력은 도장 없이 그대로 둔다(오늘 상태 실패는 TodayProvider가 오류 화면으로 넘긴다).
      .catch((error) => console.error("[home] 이번 달 기록을 불러오지 못했습니다.", error));
    return () => {
      active = false;
    };
  }, [month]);

  const todayStamp = todayState?.stampId ? { [todayState.date]: todayState.stampId } : {};

  return <MonthGrid month={month} today={today} holidays={holidays} stamps={{ ...stamps, ...todayStamp }} />;
}
