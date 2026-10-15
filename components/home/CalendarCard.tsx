import { Skeleton } from "@/components/ui/Skeleton";
import { SketchFrame, SketchLine } from "@/components/ui/sketch";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const CALENDAR_CELLS = 35;

// 데스크톱 홈 오른쪽의 이번 달 달력. 달, 누적·연속 칩, 날짜 칸은 데이터가 들어올 자리다.
export function CalendarCard() {
  return (
    <section aria-label="이번 달 기록" className="relative flex flex-col gap-2 bg-paper px-5 pt-[18px] pb-3.5">
      <SketchFrame />
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-[72px] rounded-full" />
          <Skeleton className="h-7 w-[72px] rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-ink-muted">
        {WEEKDAYS.map((day, i) => (
          <span key={day} className={i === 0 ? "text-sunday" : i === 6 ? "text-saturday" : undefined}>
            {day}
          </span>
        ))}
      </div>
      <SketchLine tone="faint" />
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: CALENDAR_CELLS }, (_, i) => (
          <div key={i} className="flex h-[46px] justify-center pt-1">
            <Skeleton className="h-2.5 w-3.5" />
          </div>
        ))}
      </div>
    </section>
  );
}
