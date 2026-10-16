import { MonthGrid } from "@/components/records/MonthGrid";
import { MonthNav } from "@/components/records/MonthNav";
import { RecordDetail } from "@/components/records/RecordDetail";
import { RecordsEmpty } from "@/components/records/RecordsEmpty";
import { StatChips } from "@/components/records/StatChips";
import { TodayMonthLink } from "@/components/records/TodayMonthLink";
import { SketchFrame } from "@/components/ui/sketch";
import { getHolidays } from "@/lib/holidays";
import { getToday } from "@/lib/today";
import packageJson from "@/package.json";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// 기록: 월간 달력, 누적·연속 칩, 날짜 상세, 앱 정보. 날짜 선택은 아직 동작하지 않는다.
// 보여줄 달은 ?month=YYYY-MM으로 받고, 없거나 잘못됐거나 이번 달 이후면 이번 달을 보여준다.
export default async function RecordsPage({ searchParams }: PageProps<"/records">) {
  const today = await getToday();
  const currentMonth = today.slice(0, 7);
  const { month: param } = await searchParams;
  const month =
    typeof param === "string" && MONTH_PATTERN.test(param) && param < currentMonth ? param : currentMonth;

  const holidays = await getHolidays(`${month}-01`);
  // 기록 데이터를 아직 연결하지 않아 항상 '기록 없음' 상태로 그린다.
  const totalCompleted = 0;
  const streak = 0;
  const isEmpty = totalCompleted === 0;
  // 처음 쓴 달(/api/records의 firstMonth)이 생기면 그 이전으로는 막는다. 지금은 제한 없이 넘긴다.
  const canGoPrev = true;

  return (
    <main className="mx-auto w-full max-w-120 px-6 pt-6.5 pb-28 lg:flex lg:max-w-272 lg:gap-16 lg:pt-7.5 lg:pb-12">
      <h1 className="font-hand text-[32px] leading-[1.1] font-bold lg:sr-only">기록</h1>

      <section aria-labelledby="records-month" className="lg:flex lg:w-160 lg:shrink-0 lg:flex-col lg:gap-3">
        <div className="mt-2.5 flex flex-col gap-1.5 lg:mt-0 lg:flex-row lg:items-center lg:justify-between">
          <MonthNav month={month} currentMonth={currentMonth} canGoPrev={canGoPrev} />
          {/* '오늘' 버튼: 모바일은 칩 줄 오른쪽 끝, 데스크톱은 칩 왼쪽 */}
          <div className="flex items-center justify-between lg:gap-3">
            <StatChips total={totalCompleted} streak={streak} />
            {month !== currentMonth && <TodayMonthLink className="lg:order-first" />}
          </div>
        </div>

        <div className="relative mt-3 flex flex-col gap-2 bg-paper px-3.5 pt-3.5 pb-3 lg:mt-0 lg:px-4.5 lg:pt-4 lg:pb-3.5">
          <SketchFrame />
          <MonthGrid month={`${month}-01`} today={today} holidays={holidays} variant="records" />
        </div>
      </section>

      <div className="mt-3.5 flex flex-col lg:mt-0 lg:w-84 lg:shrink-0 lg:pt-14">
        {isEmpty ? <RecordsEmpty /> : <RecordDetail />}
        {!isEmpty && (
          <p className="mt-3 hidden text-center text-xs text-ink-muted lg:block">
            지난 날짜를 누르면 그날의 기록을 볼 수 있어요
          </p>
        )}
        <p className="mt-3.5 text-center text-xs text-ink-muted lg:mt-7">
          버전 {packageJson.version} · 만든 사람 유진
        </p>
      </div>
    </main>
  );
}
