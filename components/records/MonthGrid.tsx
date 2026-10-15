import { SketchLine } from "@/components/ui/sketch";
import { getMonthCells } from "@/lib/date";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 칸 높이는 날짜 숫자(16px) + 작은 도장(compact 28px, records 30px / 데스크톱 42px) + 여백
const variants = {
  // 홈 데스크톱의 이번 달 달력
  compact: {
    weekdays: "text-xs",
    grid: "gap-x-0.5 gap-y-1",
    cell: "h-13",
    today: "inset-x-1.5",
    label: "text-[11px]",
  },
  // 기록 화면의 큰 달력
  records: {
    weekdays: "text-xs lg:text-[13px]",
    grid: "gap-x-0.5 gap-y-1 lg:gap-1",
    cell: "h-13 lg:h-17.5",
    today: "inset-x-0.5 lg:inset-x-2",
    label: "text-[11px] lg:text-xs",
  },
} as const;

// 요일 줄, 구분선, 날짜 칸. 부모의 flex gap을 그대로 쓰도록 Fragment로 돌려준다.
export function MonthGrid({
  month,
  today,
  variant = "compact",
}: {
  month: string;
  today: string;
  variant?: keyof typeof variants;
}) {
  const styles = variants[variant];
  const cells = getMonthCells(month);

  return (
    <>
      <div className={`grid grid-cols-7 gap-0.5 text-center text-ink-muted ${styles.weekdays}`}>
        {WEEKDAYS.map((day, i) => (
          <span key={day} className={i === 0 ? "text-sunday" : i === 6 ? "text-saturday" : undefined}>
            {day}
          </span>
        ))}
      </div>
      <SketchLine tone="faint" />
      <div className={`grid grid-cols-7 ${styles.grid}`}>
        {cells.map((cell, i) => {
          const isToday = cell?.date === today;
          return (
            <div
              key={cell?.date ?? `blank-${i}`}
              aria-current={isToday ? "date" : undefined}
              className={`relative flex flex-col items-center gap-0.5 pt-1 ${styles.cell}`}
            >
              {isToday && (
                <span
                  aria-hidden
                  className={`absolute inset-y-px rounded-sketch-day border-2 border-primary filter-crayon-sm ${styles.today}`}
                />
              )}
              {cell && <span className={`leading-4 text-ink-muted ${styles.label}`}>{cell.day}</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}
