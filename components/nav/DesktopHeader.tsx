"use client";

import { usePathname } from "next/navigation";
import { SketchLine } from "@/components/ui/sketch";
import { NAV_ITEMS, navIconClass } from "./nav-items";

// 데스크톱 상단 헤더. 지금은 이동 동작 없이 버튼 모양만 둔다.
export function DesktopHeader({ dateLabel }: { dateLabel: string }) {
  const pathname = usePathname();

  return (
    <header className="hidden lg:block">
      <div className="relative mx-auto flex h-21 max-w-272 items-center justify-between px-6">
        <div className="flex items-baseline gap-3.5">
          <p className="font-hand text-[32px] font-bold leading-none">밍기적 챌린지</p>
          <p className="text-sm text-ink-muted">{dateLabel}</p>
        </div>
        <nav aria-label="주 메뉴">
          <ul className="flex gap-1">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const current = pathname === href;
              return (
                <li key={href}>
                  <button
                    type="button"
                    aria-current={current ? "page" : undefined}
                    className={`relative flex items-center gap-2 px-4 py-3 text-[15px] ${
                      current ? "font-bold text-primary" : "text-ink"
                    }`}
                  >
                    <Icon className={`size-5.5 ${navIconClass}`} />
                    {label}
                    {current && <SketchLine tone="primary" className="absolute inset-x-3 bottom-0.5" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <SketchLine className="absolute inset-x-6 bottom-0" />
      </div>
    </header>
  );
}
