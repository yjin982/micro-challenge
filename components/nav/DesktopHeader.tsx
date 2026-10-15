"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SketchLine } from "@/components/ui/sketch";
import { NAV_ITEMS, navIconClass } from "./nav-items";

// 데스크톱 상단 헤더. 날짜는 서버 컴포넌트(TodayLabel)를 받아 그대로 넣는다.
export function DesktopHeader({ date }: { date: ReactNode }) {
  const pathname = usePathname();

  return (
    <header className="hidden lg:block">
      <div className="relative mx-auto flex h-21 max-w-272 items-center justify-between px-6">
        <div className="flex items-baseline gap-3.5">
          <p className="font-hand text-[32px] font-bold leading-none">밍기적 챌린지</p>
          <p className="text-sm text-ink-muted">{date}</p>
        </div>
        <nav aria-label="주 메뉴">
          <ul className="flex gap-1">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const current = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={current ? "page" : undefined}
                    className={`relative flex items-center gap-2 px-4 py-3 text-[15px] ${
                      current ? "font-bold text-primary" : "text-ink"
                    }`}
                  >
                    <Icon className={`size-5.5 ${navIconClass}`} />
                    {label}
                    {current && <SketchLine tone="primary" className="absolute inset-x-3 bottom-0.5" />}
                  </Link>
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
