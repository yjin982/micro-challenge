import { SketchFrame } from "@/components/ui/sketch";
import { formatMonthLabel } from "@/lib/date";
import type { Holidays } from "@/lib/holidays";
import { HomeMonthGrid } from "./HomeMonthGrid";
import { TodayStatChips } from "./TodayStatChips";

// 데스크톱 홈 오른쪽의 이번 달 달력(완료한 날에 도장)과 누적·연속 칩
export function CalendarCard({ today, holidays }: { today: string; holidays: Holidays }) {
  return (
    <section aria-labelledby="calendar-title" className="relative flex flex-col gap-2 bg-paper px-5 pt-4.5 pb-4">
      <SketchFrame />
      <div className="flex items-center justify-between">
        <h2 id="calendar-title" className="font-hand text-[26px] font-bold">
          {formatMonthLabel(today)}
        </h2>
        <TodayStatChips />
      </div>
      <HomeMonthGrid month={today} today={today} holidays={holidays} />
    </section>
  );
}
