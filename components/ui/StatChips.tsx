import { Skeleton } from "./Skeleton";

// 누적 완료 수와 연속 일수 칩. 홈 달력 카드와 기록 화면이 함께 쓴다.
export function StatChips({ total, streak }: { total: number; streak: number }) {
  return (
    <div className="flex gap-2">
      <span className="rounded-full bg-chip-today px-3 py-1.5 text-[13px] font-bold">누적 {total}개</span>
      <span className="rounded-full bg-chip-streak px-3 py-1.5 text-[13px] font-bold text-chip-streak-ink">
        {streak}일 연속
      </span>
    </div>
  );
}

// 값을 불러오는 동안 칩 자리
export function StatChipsSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-7 w-18" rounded="rounded-full" />
      <Skeleton className="h-7 w-18" rounded="rounded-full" />
    </div>
  );
}
