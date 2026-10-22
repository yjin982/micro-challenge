"use client";

import { useId } from "react";
import { SketchFrame } from "@/components/ui/sketch";
import { AccountPanel } from "./AccountPanel";
import { useAccount } from "./useAccount";
import { usePopover } from "./usePopover";

// 모바일 화면 제목 줄 오른쪽의 계정 메뉴. 세션이 있으면(익명·계정 모두) 햄버거 버튼이 보이고,
// 누르면 계정 상태별 메뉴(AccountPanel)가 열린다. 데스크톱은 상단 헤더(AccountStatus)가 맡는다.
export function MobileAccountMenu() {
  const account = useAccount();
  const { open, setOpen, rootRef } = usePopover();
  const menuId = useId();

  if (!account) return null;

  return (
    // 음수 여백: 44px 버튼이 제목 줄 높이를 늘리지 않고, 아이콘이 오른쪽 끝에 맞도록
    <div ref={rootRef} className="relative -my-2 -mr-2.5 lg:hidden">
      <button
        type="button"
        aria-label="계정 메뉴"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="flex size-11 items-center justify-center"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="size-6.5 fill-none stroke-ink stroke-2 [stroke-linecap:round] filter-crayon-sm"
        >
          <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
        </svg>
      </button>
      {open && (
        <div id={menuId} className="absolute top-full right-0 z-20 mt-1 flex w-64 flex-col gap-3 bg-paper p-4">
          <SketchFrame shape="sm" />
          <AccountPanel account={account} />
        </div>
      )}
    </div>
  );
}
