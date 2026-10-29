import { Stamp } from "@/components/stamp/Stamp";
import { SketchLine } from "@/components/ui/sketch";
import { formatDetailDate, getMonthCells } from "@/lib/date";
import type { Holidays } from "@/lib/holidays";
import type { StampId } from "@/types/api";
import { HolidayLabel } from "./HolidayLabel";

export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
// 작은 도장을 날짜마다 조금씩 기울여 손으로 찍은 느낌을 낸다(화면 설계의 tilt 값). 홈의 이번 주 7일 줄도 쓴다
export const STAMP_TILTS = [-8, 6, -3, 9, -10, 4];

// 칸 높이 = 날짜 숫자(16px) + 국경일·공휴일 이름 한 줄(12px) + 작은 도장(30px / 데스크톱 42px) + 여백 2px씩.
// 공휴일에 도장이 찍혀도 이름을 가리지 않도록 이름 줄 자리까지 잡아 둔다.
// 이름은 칸보다 길면 말줄임한 뒤 말풍선으로 전체 이름을 보여준다.
const styles = {
  weekdays: "text-xs lg:text-[13px]",
  grid: "gap-x-0.5 gap-y-1 lg:gap-1",
  cell: "h-15.5 lg:h-18.5",
  today: "inset-x-0.5 lg:inset-x-2",
  label: "text-[11px] lg:text-xs",
  holiday: "text-[9px] lg:text-[11px]",
  stamp: "size-7.5 lg:size-10.5",
  // 아직 오지 않은 날은 흐리게(요일·공휴일 색은 유지)
  future: "opacity-50",
};

// 날짜 숫자와 특일 이름 색: 일요일과 공휴일은 빨강, 토요일은 파랑. 토요일이 공휴일이면 빨강이 우선한다.
// 쉬지 않는 국경일(isHoliday=N)은 요일 색을 그대로 따른다.
export function dayColor(weekday: number, isHoliday: boolean) {
  if (isHoliday || weekday === 0) return "text-sunday";
  if (weekday === 6) return "text-saturday";
  return "text-ink-muted";
}

// 기록 화면의 월간 달력: 요일 줄, 구분선, 날짜 칸. 부모의 flex gap을 그대로 쓰도록 Fragment로 돌려준다.
// stamps가 있으면 완료한 날에 작은 도장을 찍고, onSelect가 있으면 오늘까지의 날짜를 눌러 고를 수 있다.
export function MonthGrid({
  month,
  today,
  holidays = {},
  stamps = {},
  selected = null,
  onSelect,
}: {
  month: string;
  today: string;
  holidays?: Holidays;
  stamps?: Record<string, StampId>;
  selected?: string | null;
  onSelect?: (date: string) => void;
}) {
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
          const stampId = cell ? stamps[cell.date] : undefined;
          const selectable = !!onSelect && !!cell && cell.date <= today;
          const isSelected = !!cell && cell.date === selected;
          return (
            <div
              key={cell?.date ?? `blank-${i}`}
              aria-current={isToday ? "date" : undefined}
              className={`relative flex flex-col items-center gap-0.5 pt-1 ${styles.cell}`}
            >
              {isSelected && (
                <span aria-hidden className={`absolute inset-y-0.5 rounded-xl bg-chip-today ${styles.today}`} />
              )}
              {isToday && (
                <span
                  aria-hidden
                  className={`absolute inset-y-px rounded-sketch-day border-2 border-primary filter-crayon-sm ${styles.today}`}
                />
              )}
              {cell && (
                // 색은 이름과 말풍선까지 물려주고, 흐림(future)은 글자에만 걸어 말풍선까지 흐려지지 않게 한다.
                // relative: 선택 배경(absolute)보다 위에 그려지게 한다.
                <span className={`relative flex w-full flex-col items-center ${dayColor(i % 7, holiday?.isHoliday ?? false)}`}>
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
              {cell && stampId && (
                <Stamp
                  variant={stampId}
                  mini
                  size={42}
                  tilt={STAMP_TILTS[cell.day % STAMP_TILTS.length]}
                  className={`pointer-events-none absolute bottom-0.5 left-1/2 -translate-x-1/2 ${styles.stamp}`}
                />
              )}
              {/* 칸 전체를 덮는 선택 버튼. 공휴일 이름(말풍선 버튼)은 z-10으로 이 위에 있어 버튼이 겹치지 않는다 */}
              {cell && selectable && (
                <button
                  type="button"
                  onClick={() => onSelect(cell.date)}
                  aria-pressed={isSelected}
                  aria-label={`${formatDetailDate(cell.date)} ${stampId ? "기록 보기" : "보기"}`}
                  className="absolute inset-0 rounded-xl focus-visible:outline-2 focus-visible:outline-primary"
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
