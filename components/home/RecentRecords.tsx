"use client";

import Link from "next/link";
import { Stamp } from "@/components/stamp/Stamp";
import { SketchFrame } from "@/components/ui/sketch";
import { formatShortDate } from "@/lib/date";
import { useToday } from "./TodayProvider";

const RECENT_COUNT = 3;

// 최근 완료 기록 3칸(날짜, 작은 도장, 미션 문구).
// 기록이 없는 것을 기본으로 두고 영역을 숨긴다. 오늘 상태를 불러와 기록이 있을 때만 보여주며,
// 1~2개면 3칸 배치는 그대로 앞에서부터 채운다(화면 설계 '최근 기록 상태').
export function RecentRecords() {
  const recent = useToday()?.recent ?? [];
  if (recent.length === 0) return null;

  return (
    <section aria-labelledby="recent-records-title">
      <div className="flex items-baseline justify-between pt-5.5 pb-2 lg:px-1 lg:pt-6 lg:pb-2.5">
        <h2 id="recent-records-title" className="font-hand text-[22px] font-bold lg:text-2xl">
          최근 기록
        </h2>
        <Link href="/records" className="text-[13px] text-ink-muted">
          전체 보기
        </Link>
      </div>
      <ul className="grid grid-cols-3 gap-3 lg:gap-3.5">
        {recent.slice(0, RECENT_COUNT).map((record) => (
          <li key={record.date} className="relative flex h-24 flex-col gap-1.5 bg-paper p-2 lg:h-23 lg:px-3 lg:py-2.5">
            <SketchFrame shape="sm" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-muted">{formatShortDate(record.date)}</span>
              <Stamp variant={record.stampId} mini size={34} decorative />
            </div>
            <p className="text-xs leading-[1.35] lg:text-[13px]">{record.missionText}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
