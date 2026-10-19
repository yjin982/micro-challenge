import Image from "next/image";
import { SketchFrame } from "@/components/ui/sketch";
import { formatMonthLabel } from "@/lib/date";
import type { Holidays } from "@/lib/holidays";
import type { TodayState } from "@/types/api";
import { HomeMonthGrid } from "./HomeMonthGrid";

// 모바일 연속 달성 화면(화면 설계 '홈 · 연속 달성'): 연속 일수와 오늘 미션, 이번 달 도장 달력, 누적 개수.
// 오늘 완료한 뒤 홈에 다시 들어오면 바로 이 화면이 보인다.
export function StreakView({ today, date, holidays }: { today: TodayState; date: string; holidays: Holidays }) {
  return (
    <>
      <div className="mt-3 flex items-center gap-3">
        <Image src="/images/mascot/tyrano-excited.png" alt="" width={217} height={182} loading="eager" className="h-auto w-25" />
        <div className="flex flex-col gap-1">
          <p className="font-hand text-[36px] leading-[1.05] font-bold">
            <span className="text-primary">{today.streak}일</span> 연속 달성!
          </p>
          {today.mission && <p className="text-[13px] leading-[1.4] text-ink-muted">오늘: {today.mission.text}</p>}
        </div>
      </div>

      <section
        aria-labelledby="streak-calendar-title"
        className="relative mt-4 flex flex-col gap-2 bg-paper px-3.5 pt-4.5 pb-3.5"
      >
        <SketchFrame />
        <h2 id="streak-calendar-title" className="pl-1 font-hand text-[22px] font-bold">
          {formatMonthLabel(date)}
        </h2>
        <HomeMonthGrid month={date} today={date} holidays={holidays} />
      </section>

      <p className="mt-4 text-center font-hand text-[21px]">
        지금까지 <strong className="text-primary">{today.totalCompleted}개</strong>의 도전을 완료했어요!
      </p>
      <p className="mt-1.5 flex items-center justify-center gap-1.5 font-hand text-2xl font-bold">
        <Image src="/images/decor/star-orange.svg" alt="" width={40} height={40} className="size-5.5" />
        내일 또 만나요
      </p>
    </>
  );
}
