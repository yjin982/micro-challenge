"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useToday } from "./TodayProvider";

const MAX_REROLLS = 3;

// 남은 재뽑기 표시. 남은 만큼 주황 점을 채우고, 쓴 만큼 비운다. 뽑기 전에는 항상 3개가 모두 채워져 있다.
export function RerollDots({ className = "" }: { className?: string }) {
  const today = useToday();
  const left = today?.rerollsLeft ?? MAX_REROLLS;

  return (
    <div className={`flex items-center justify-center gap-2 text-[13px] text-ink-muted ${className}`}>
      <span>다시 뽑기</span>
      {Array.from({ length: MAX_REROLLS }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={`size-3 rounded-full border-[1.5px] border-ink-muted ${i < left ? "bg-crayon-orange" : "bg-paper"}`}
        />
      ))}
      {today ? <span>{left}번 남음</span> : <Skeleton className="h-3.5 w-12" />}
    </div>
  );
}
