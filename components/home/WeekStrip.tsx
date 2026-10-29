"use client";

import { useEffect, useId, useState } from "react";
import { HolidayLabel } from "@/components/records/HolidayLabel";
import { dayColor, STAMP_TILTS, WEEKDAYS } from "@/components/records/MonthGrid";
import { Stamp } from "@/components/stamp/Stamp";
import { SketchFrame } from "@/components/ui/sketch";
import { api } from "@/lib/api";
import { formatDetailDate, formatShortDate, getWeekDates } from "@/lib/date";
import type { Holidays } from "@/lib/holidays";
import type { StampId } from "@/types/api";
import { useToday } from "./TodayProvider";

// 홈의 이번 주 7일 줄(일요일 시작). 데스크톱 오른쪽 열 맨 위와 모바일 연속 달성 화면에 둔다.
// 월간 달력은 기록 화면에만 있다. 완료한 날에 작은 도장, 아직 없는 날은 빈 점선 동그라미(오늘은 초록).
// 이번 주 완료 기록(GET /api/records)을 불러오고, 오늘 도장은 오늘 상태(TodayProvider)에서도 가져와
// 홈에서 완료하면 다시 불러오지 않아도 바로 찍힌다.
export function WeekStrip({ today, holidays }: { today: string; holidays: Holidays }) {
  const titleId = useId();
  const todayState = useToday();
  const [stamps, setStamps] = useState<Record<string, StampId>>({});
  const week = getWeekDates(today);
  // 도장은 오늘까지만 있으니 이번 주 첫날의 달과 오늘의 달만 부른다(같으면 한 번)
  const monthKey = [...new Set([week[0].slice(0, 7), today.slice(0, 7)])].join(",");

  useEffect(() => {
    let active = true;
    Promise.all(monthKey.split(",").map((month) => api.getMonth(month)))
      .then((months) => {
        if (active) setStamps(Object.fromEntries(months.flatMap(({ days }) => days.map((d) => [d.date, d.stampId]))));
      })
      // 도장은 꾸밈이라 실패해도 줄은 도장 없이 그대로 둔다(오늘 상태 실패는 TodayProvider가 오류 화면으로 넘긴다).
      .catch((error) => console.error("[home] 이번 주 기록을 불러오지 못했습니다.", error));
    return () => {
      active = false;
    };
  }, [monthKey]);

  const allStamps = todayState?.stampId ? { ...stamps, [todayState.date]: todayState.stampId } : stamps;

  return (
    <section aria-labelledby={titleId} className="relative flex flex-col gap-3 bg-paper px-3.5 pt-4 pb-3.5 lg:px-5 lg:pt-4.5 lg:pb-4">
      <SketchFrame />
      <div className="flex items-baseline justify-between px-1 lg:px-0">
        <h2 id={titleId} className="font-hand text-[22px] font-bold lg:text-[26px]">
          이번 주
        </h2>
        <span className="text-[13px] text-ink-muted">
          {formatShortDate(week[0])} – {formatShortDate(week[6])}
        </span>
      </div>
      <ol className="grid grid-cols-7 gap-0.5 lg:gap-1">
        {week.map((date, i) => {
          const isToday = date === today;
          const future = date > today ? "opacity-50" : "";
          const holiday = holidays[date];
          const stampId = allStamps[date];
          const day = Number(date.slice(8));
          return (
            <li
              key={date}
              aria-current={isToday ? "date" : undefined}
              className="relative flex flex-col items-center gap-1 pt-1.5 pb-2"
            >
              {isToday && (
                <span
                  aria-hidden
                  className="absolute inset-x-0.5 inset-y-0 rounded-sketch-day border-2 border-primary filter-crayon-sm lg:inset-x-1.5"
                />
              )}
              <span className="sr-only">
                {formatDetailDate(date)}
                {isToday ? " 오늘" : ""}
                {holiday ? ` ${holiday.name}` : ""}
                {stampId ? " 완료" : ""}
              </span>
              <span aria-hidden className={`flex w-full flex-col items-center ${dayColor(i, holiday?.isHoliday ?? false)}`}>
                <span className={`text-xs leading-4 ${future}`}>{WEEKDAYS[i]}</span>
                <span className={`text-[13px] leading-4.5 font-bold lg:text-sm ${future}`}>{day}</span>
              </span>
              {/* 공휴일 이름 줄. 이름이 없는 날도 자리를 잡아 도장 줄을 맞춘다 */}
              <span className={`flex h-3 w-full justify-center ${dayColor(i, holiday?.isHoliday ?? false)}`}>
                {holiday && (
                  <HolidayLabel
                    name={holiday.name}
                    align={i === 0 ? "start" : i === 6 ? "end" : "center"}
                    className={`text-[9px] leading-3 lg:text-[10px] ${future}`}
                  />
                )}
              </span>
              {stampId ? (
                <Stamp variant={stampId} mini size={44} tilt={STAMP_TILTS[day % STAMP_TILTS.length]} decorative className="size-9 lg:size-11" />
              ) : (
                <span
                  aria-hidden
                  className={`size-9 rounded-full border-2 border-dashed lg:size-11 ${isToday ? "border-crayon-green" : "border-line-faint"} ${future}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
