import { TZDate } from "@date-fns/tz";
import { addDays, addMonths, format, getDay, getDaysInMonth, lastDayOfMonth, parseISO, startOfMonth } from "date-fns";
import { ko } from "date-fns/locale";

// 모든 함수는 서버가 준 날짜 문자열(YYYY-MM-DD)을 받는다. 화면에서 현재 시각으로 날짜를 계산하지 않는다.

// "10월 15일 목요일"
export function formatDayLabel(date: string): string {
  return format(parseISO(date), "M월 d일 EEEE", { locale: ko });
}

// 기록 상세의 "9월 27일 (일)"
export function formatDetailDate(date: string): string {
  return format(parseISO(date), "M월 d일 (EEE)", { locale: ko });
}

// 완료 시각(서버의 timestamptz)을 한국 시간 "오후 1:23"으로
export function formatCompletedTime(completedAt: string): string {
  return format(new TZDate(completedAt, "Asia/Seoul"), "a h:mm", { locale: ko });
}

// "2026-09" → 그 달 마지막 날 "2026-09-30"
export function lastDateOfMonth(month: string): string {
  return format(lastDayOfMonth(parseISO(`${month}-01`)), "yyyy-MM-dd");
}

// 최근 기록 카드의 "9.27"
export function formatShortDate(date: string): string {
  return format(parseISO(date), "M.d");
}

// "2026년 10월"
export function formatMonthLabel(date: string): string {
  return format(parseISO(date), "yyyy년 M월");
}

// "2026-10" → 앞뒤 달("2026-09", "2026-11")
export function shiftMonth(month: string, amount: number): string {
  return format(addMonths(parseISO(`${month}-01`), amount), "yyyy-MM");
}

export type CalendarCell = { date: string; day: number } | null;

// 일요일 시작 월간 달력 칸. 앞뒤 빈칸은 null이고, 항상 7의 배수(5주 또는 6주)다.
export function getMonthCells(date: string): CalendarCell[] {
  const first = startOfMonth(parseISO(date));
  const leading = getDay(first);
  const days = getDaysInMonth(first);
  const total = Math.ceil((leading + days) / 7) * 7;

  return Array.from({ length: total }, (_, i) => {
    const offset = i - leading;
    if (offset < 0 || offset >= days) return null;
    return { date: format(addDays(first, offset), "yyyy-MM-dd"), day: offset + 1 };
  });
}
