"use client";

import { motion } from "motion/react";
import Image from "next/image";
import type { Holidays } from "@/lib/holidays";
import type { TodayState } from "@/types/api";
import { RecentRecords } from "./RecentRecords";
import { WeekStrip } from "./WeekStrip";

// 모바일 연속 달성 화면(화면 설계 '홈 · 연속 달성'): 연속 일수와 오늘 미션, 이번 주 7일 줄, 최근 기록, 누적 개수.
// 화면 설계의 이번 달 달력은 기록 화면과 겹쳐 이번 주 7일 줄로 바꿨다.
// 완료 화면에서 넘어오거나, 오늘 완료한 뒤 홈에 다시 들어오면 이 화면이 보인다. 나타날 때 살짝 페이드인한다.
export function StreakView({ today, date, holidays }: { today: TodayState; date: string; holidays: Holidays }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <div className="mt-3 flex items-center gap-3">
        <Image src="/images/mascot/tyrano-done.png" alt="" width={212} height={187} loading="eager" className="h-auto w-25" />
        <div className="flex flex-col gap-1">
          <p className="font-hand text-[36px] leading-[1.05] font-bold">
            <span className="text-primary">{today.streak}일</span> 연속 달성!
          </p>
          {today.mission && <p className="text-[13px] leading-[1.4] text-ink-muted">오늘: {today.mission.text}</p>}
        </div>
      </div>

      {/* 7일 줄 오른쪽 위 모서리에는 테이프가 붙어 있다(WeekStrip) */}
      <div className="mt-4">
        <WeekStrip today={date} holidays={holidays} />
      </div>
      <RecentRecords />

      <p className="mt-6 text-center font-hand text-[21px]">
        지금까지 <strong className="text-primary">{today.totalCompleted}개</strong>의 도전을 완료했어요!
      </p>
      <p className="mt-1.5 flex items-center justify-center gap-1.5 font-hand text-2xl font-bold">
        <Image src="/images/decor/star-orange.svg" alt="" width={40} height={40} className="size-5.5" />
        내일 또 만나요
      </p>
    </motion.div>
  );
}
