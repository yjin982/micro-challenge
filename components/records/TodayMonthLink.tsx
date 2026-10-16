import Link from "next/link";

// 지난달을 보고 있을 때 오늘이 있는 달(/records)로 바로 돌아가는 버튼
export function TodayMonthLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/records"
      scroll={false}
      aria-label="오늘이 있는 달로 이동"
      className={`flex h-9 items-center gap-1 rounded-sketch-sm border-2 border-ink-muted bg-paper px-3 font-hand text-lg font-bold ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="size-4.5 fill-none stroke-ink stroke-[2.4] [stroke-linecap:round] [stroke-linejoin:round] filter-crayon-sm"
      >
        <path d="M9 14 L4 9 L9 4 M4 9 H14 A6 6 0 0 1 14 21 H10" />
      </svg>
      오늘
    </Link>
  );
}
