import { MonthGrid } from "@/components/records/MonthGrid";
import { MonthNav } from "@/components/records/MonthNav";
import { RecordDetail } from "@/components/records/RecordDetail";
import { Skeleton } from "@/components/ui/Skeleton";
import { SketchFrame } from "@/components/ui/sketch";
import { getToday } from "@/lib/today";
import packageJson from "@/package.json";

// 기록: 월간 달력, 누적·연속 칩, 날짜 상세, 앱 정보. 달 이동과 날짜 선택은 아직 동작하지 않는다.
export default async function RecordsPage() {
  const today = await getToday();

  return (
    <main className="mx-auto w-full max-w-120 px-6 pt-6.5 pb-28 lg:flex lg:max-w-272 lg:gap-16 lg:pt-7.5 lg:pb-12">
      <h1 className="font-hand text-[32px] leading-[1.1] font-bold lg:sr-only">기록</h1>

      <section aria-labelledby="records-month" className="lg:flex lg:w-160 lg:shrink-0 lg:flex-col lg:gap-3">
        <div className="mt-2.5 flex flex-col gap-1.5 lg:mt-0 lg:flex-row lg:items-center lg:justify-between">
          <MonthNav month={today} />
          {/* 누적·연속 칩 */}
          <div className="flex gap-2">
            <Skeleton className="h-7 w-18 rounded-full" />
            <Skeleton className="h-7 w-18 rounded-full" />
          </div>
        </div>

        <div className="relative mt-3 flex flex-col gap-2 bg-paper px-3.5 pt-3.5 pb-3 lg:mt-0 lg:px-4.5 lg:pt-4 lg:pb-3.5">
          <SketchFrame />
          <MonthGrid month={today} today={today} variant="records" />
        </div>
      </section>

      <div className="mt-3.5 flex flex-col lg:mt-0 lg:w-84 lg:shrink-0 lg:pt-14">
        <RecordDetail />
        <p className="mt-3 hidden text-center text-xs text-ink-muted lg:block">
          도장이 찍힌 날짜를 누르면 그날의 기록을 볼 수 있어요
        </p>
        <p className="mt-3.5 text-center text-xs text-ink-muted lg:mt-7">
          버전 {packageJson.version} · 만든 사람 유진
        </p>
      </div>
    </main>
  );
}
