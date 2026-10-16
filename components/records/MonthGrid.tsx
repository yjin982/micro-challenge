import { SketchLine } from "@/components/ui/sketch";
import { getMonthCells } from "@/lib/date";
import type { Holidays } from "@/lib/holidays";
import { HolidayLabel } from "./HolidayLabel";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 칸 높이는 날짜 숫자(16px) + 작은 도장(compact 28px, records 30px / 데스크톱 42px) + 여백
// 국경일·공휴일 이름은 숫자 바로 아래 한 줄에 넣고, 칸보다 길면 말줄임한 뒤 말풍선으로 전체 이름을 보여준다.
const variants = {
  // 홈 데스크톱의 이번 달 달력
  compact: {
    weekdays: "text-xs",
    grid: "gap-x-0.5 gap-y-1",
    cell: "h-13",
    today: "inset-x-1.5",
    label: "text-[11px]",
    holiday: "text-[9px]",
    future: "",
  },
  // 기록 화면의 큰 달력
  records: {
    weekdays: "text-xs lg:text-[13px]",
    grid: "gap-x-0.5 gap-y-1 lg:gap-1",
    cell: "h-13 lg:h-17.5",
    today: "inset-x-0.5 lg:inset-x-2",
    label: "text-[11px] lg:text-xs",
    holiday: "text-[9px] lg:text-[11px]",
    // 아직 오지 않은 날은 흐리게(요일·공휴일 색은 유지)
    future: "opacity-50",
  },
} as const;

// 날짜 숫자와 특일 이름 색: 일요일과 공휴일은 빨강, 토요일은 파랑. 토요일이 공휴일이면 빨강이 우선한다.
// 쉬지 않는 국경일(isHoliday=N)은 요일 색을 그대로 따른다.
function dayColor(weekday: number, isHoliday: boolean) {
  if (isHoliday || weekday === 0) return "text-sunday";
  if (weekday === 6) return "text-saturday";
  return "text-ink-muted";
}

// 요일 줄, 구분선, 날짜 칸. 부모의 flex gap을 그대로 쓰도록 Fragment로 돌려준다.
export function MonthGrid({
  month,
  today,
  holidays = {},
  variant = "compact",
}: {
  month: string;
  today: string;
  holidays?: Holidays;
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
          const holiday = cell ? holidays[cell.date] : undefined;
          const future = cell && cell.date > today ? styles.future : "";
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
              {cell && (
                // 색은 이름과 말풍선까지 물려주고, 흐림(future)은 글자에만 걸어 말풍선까지 흐려지지 않게 한다.
                <span className={`flex w-full flex-col items-center ${dayColor(i % 7, holiday?.isHoliday ?? false)}`}>
                  <span className={`leading-4 ${styles.label} ${future}`}>{cell.day}</span>
                  {holiday && (
                    <HolidayLabel
                      name={holiday.name}
                      align={i % 7 === 0 ? "start" : i % 7 === 6 ? "end" : "center"}
                      className={`leading-3 ${styles.holiday} ${future}`}
                    />
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
