"use client";

import { StatChips } from "@/components/records/StatChips";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToday } from "./TodayProvider";

// 홈 달력 위의 누적·연속 칩. 오늘 상태를 불러오기 전에는 스켈레톤
export function TodayStatChips() {
  const today = useToday();

  if (!today) {
    return (
      <div className="flex gap-2">
        <Skeleton className="h-7 w-18 rounded-full" />
        <Skeleton className="h-7 w-18 rounded-full" />
      </div>
    );
  }
  return <StatChips total={today.totalCompleted} streak={today.streak} />;
}
