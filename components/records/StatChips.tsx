// 누적 완료 수와 연속 일수 칩
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
