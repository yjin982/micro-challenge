"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "@/components/auth/useAccount";
import { SketchLine } from "@/components/ui/sketch";
import { NAV_ITEMS, isAuthScreen, isPublicPage, navIconClass } from "./nav-items";

// 모바일 하단 탭. 시작·로그인 화면과, 세션 없이 연 처리방침·약관에서는 숨긴다.
export function BottomTabs() {
  const pathname = usePathname();
  const account = useAccount();
  if (isAuthScreen(pathname) || (isPublicPage(pathname) && !account)) return null;

  return (
    <nav
      aria-label="주 메뉴"
      className="fixed inset-x-0 bottom-0 z-10 bg-paper-texture pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <SketchLine className="absolute inset-x-3 top-0" />
      <ul className="mx-auto flex h-18.5 max-w-120 items-center justify-around">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const current = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`flex min-h-12 min-w-16 flex-col items-center justify-center gap-0.5 text-xs ${
                  current ? "font-bold text-primary" : "text-ink"
                }`}
              >
                <Icon className={`size-6.5 ${navIconClass}`} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
