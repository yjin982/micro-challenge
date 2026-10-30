import Link from "next/link";
import type { ReactNode } from "react";
import { Doodle } from "@/components/ui/Doodle";
import { formatMonthLabel, shiftMonth } from "@/lib/date";

const chevronClass =
  "size-5.5 fill-none stroke-ink stroke-[2.4] [stroke-linecap:round] [stroke-linejoin:round] filter-crayon-sm";

// 이번 달은 쿼리 없이 /records, 지난달은 /records?month=YYYY-MM
function monthHref(month: string, currentMonth: string) {
  return month === currentMonth ? "/records" : `/records?month=${month}`;
}

// 이전·다음 달 이동. 이번 달이면 다음 달이 비활성이고, 이전 달은 canGoPrev가 막는다.
export function MonthNav({
  month,
  currentMonth,
  canGoPrev,
}: {
  month: string;
  currentMonth: string;
  canGoPrev: boolean;
}) {
  return (
    <div className="-mx-1 flex items-center justify-between lg:mx-0 lg:justify-start lg:gap-1">
      <NavArrow label="이전 달" href={canGoPrev ? monthHref(shiftMonth(month, -1), currentMonth) : null}>
        <path d="M15 5 L8 12 L15 19" />
      </NavArrow>
      <h2 id="records-month" className="text-center font-hand text-2xl font-bold lg:min-w-37.5 lg:text-3xl">
        {formatMonthLabel(`${month}-01`)}
        <Doodle name="star" className="ml-1 inline-block size-4.5 -translate-y-2.5 rotate-12" />
      </h2>
      <NavArrow
        label="다음 달"
        href={month < currentMonth ? monthHref(shiftMonth(month, 1), currentMonth) : null}
      >
        <path d="M9 5 L16 12 L9 19" />
      </NavArrow>
    </div>
  );
}

// 갈 곳이 없으면 링크 대신 흐린 아이콘만 둔다.
function NavArrow({ label, href, children }: { label: string; href: string | null; children: ReactNode }) {
  const icon = (
    <svg viewBox="0 0 24 24" aria-hidden className={chevronClass}>
      {children}
    </svg>
  );
  const className = "flex size-11 items-center justify-center";

  if (!href) {
    return (
      <span role="link" aria-label={label} aria-disabled="true" className={`${className} opacity-35`}>
        {icon}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} scroll={false} className={className}>
      {icon}
    </Link>
  );
}
