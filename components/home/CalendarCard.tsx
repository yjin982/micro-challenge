import { MonthGrid } from "@/components/records/MonthGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import { SketchFrame } from "@/components/ui/sketch";
import { formatMonthLabel } from "@/lib/date";
import type { Holidays } from "@/lib/holidays";

// 데스크톱 홈 오른쪽의 이번 달 달력. 누적·연속 칩과 완료 도장은 데이터가 들어올 자리다.
export function CalendarCard({ today, holidays }: { today: string; holidays: Holidays }) {
  return (
    <section aria-labelledby="calendar-title" className="relative flex flex-col gap-2 bg-paper px-5 pt-4.5 pb-4">
      <SketchFrame />
      <div className="flex items-center justify-between">
        <h2 id="calendar-title" className="font-hand text-[26px] font-bold">
          {formatMonthLabel(today)}
        </h2>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-18 rounded-full" />
          <Skeleton className="h-7 w-18 rounded-full" />
        </div>
      </div>
      <MonthGrid month={today} today={today} holidays={holidays} />
    </section>
  );
}
