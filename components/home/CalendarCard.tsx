import { MonthGrid } from "@/components/records/MonthGrid";
import { SketchFrame } from "@/components/ui/sketch";
import { formatMonthLabel } from "@/lib/date";
import type { Holidays } from "@/lib/holidays";
import { TodayStatChips } from "./TodayStatChips";

// 데스크톱 홈 오른쪽의 이번 달 달력과 누적·연속 칩. 완료 도장은 도장 컴포넌트가 생기면 넣는다.
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
      <MonthGrid month={today} today={today} holidays={holidays} />
    </section>
  );
}
