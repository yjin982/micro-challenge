import { formatMonthLabel } from "@/lib/date";

const chevronClass =
  "size-5.5 fill-none stroke-ink stroke-[2.4] [stroke-linecap:round] [stroke-linejoin:round] filter-crayon-sm";

// 이전·다음 달 이동. 지금은 동작 없이 버튼 모양만 둔다.
// 처음 쓴 달이면 이전 달이, 이번 달이면 다음 달이 비활성이다(지금은 항상 이번 달).
export function MonthNav({ month, canGoPrev }: { month: string; canGoPrev: boolean }) {
  return (
    <div className="-mx-1 flex items-center justify-between lg:mx-0 lg:justify-start lg:gap-1">
      <button
        type="button"
        aria-label="이전 달"
        disabled={!canGoPrev}
        className="flex size-11 items-center justify-center disabled:opacity-35"
      >
        <svg viewBox="0 0 24 24" aria-hidden className={chevronClass}>
          <path d="M15 5 L8 12 L15 19" />
        </svg>
      </button>
      <h2 id="records-month" className="text-center font-hand text-2xl font-bold lg:min-w-37.5 lg:text-3xl">
        {formatMonthLabel(month)}
      </h2>
      <button
        type="button"
        aria-label="다음 달"
        disabled
        className="flex size-11 items-center justify-center disabled:opacity-35"
      >
        <svg viewBox="0 0 24 24" aria-hidden className={chevronClass}>
          <path d="M9 5 L16 12 L9 19" />
        </svg>
      </button>
    </div>
  );
}
