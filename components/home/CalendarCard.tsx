import { Skeleton } from "@/components/ui/Skeleton";
import { SketchFrame, SketchLine } from "@/components/ui/sketch";
import { formatMonthLabel, getMonthCells } from "@/lib/date";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 데스크톱 홈 오른쪽의 이번 달 달력. 누적·연속 칩과 완료 도장은 데이터가 들어올 자리다.
export function CalendarCard({ today }: { today: string }) {
  const cells = getMonthCells(today);

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
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-ink-muted">
        {WEEKDAYS.map((day, i) => (
          <span key={day} className={i === 0 ? "text-sunday" : i === 6 ? "text-saturday" : undefined}>
            {day}
          </span>
        ))}
      </div>
      <SketchLine tone="faint" />
      {/* 칸 52px = 날짜 숫자(15px) + 작은 도장(28px) + 여백. 6주인 달도 같은 높이를 쓴다 */}
      <div className="grid grid-cols-7 gap-x-0.5 gap-y-1">
        {cells.map((cell, i) => {
          const isToday = cell?.date === today;
          return (
            <div
              key={cell?.date ?? `blank-${i}`}
              aria-current={isToday ? "date" : undefined}
              className="relative flex h-13 flex-col items-center gap-0.5 pt-1"
            >
              {isToday && (
                <span
                  aria-hidden
                  className="absolute inset-x-1.5 inset-y-px rounded-sketch-day border-2 border-primary filter-crayon-sm"
                />
              )}
              {cell && <span className="text-[11px] leading-3.75 text-ink-muted">{cell.day}</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
