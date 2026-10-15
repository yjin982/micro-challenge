import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { SketchFrame } from "@/components/ui/sketch";

const RECENT_COUNT = 3;

// 최근 완료 기록 3칸(날짜, 작은 도장, 미션 문구).
export function RecentRecords() {
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
        {Array.from({ length: RECENT_COUNT }, (_, i) => (
          <li key={i} className="relative flex h-24 flex-col gap-1.5 bg-paper p-2 lg:h-23 lg:px-3 lg:py-2.5">
            <SketchFrame shape="sm" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-8" />
              {/* 작은 도장(mini) */}
              <Skeleton className="size-8.5 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </li>
        ))}
      </ul>
    </section>
  );
}
