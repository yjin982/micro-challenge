"use client";

import { StatChips, StatChipsSkeleton } from "@/components/ui/StatChips";
import { useToday } from "./TodayProvider";

// 홈 달력 위의 누적·연속 칩. 오늘 상태를 불러오기 전에는 스켈레톤
export function TodayStatChips() {
  const today = useToday();

  if (!today) return <StatChipsSkeleton />;
  return <StatChips total={today.totalCompleted} streak={today.streak} />;
}
