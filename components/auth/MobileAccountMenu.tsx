"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SketchFrame, SketchLine } from "@/components/ui/sketch";
import { LogoutButton } from "./LogoutButton";
import { useAccount } from "./useAccount";

// 모바일 화면 제목 줄 오른쪽의 계정 메뉴. 이메일 계정으로 로그인했을 때만 햄버거 버튼이 보이고,
// 누르면 계정 이메일 · 구분선 · 로그아웃 버튼이 담긴 메뉴가 열린다. 데스크톱은 상단 헤더(AccountStatus)가 맡는다.
export function MobileAccountMenu() {
  const email = useAccount();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // 열려 있을 때 바깥을 누르거나 Esc를 누르면 닫는다.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!email) return null;

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
        <div
          id={menuId}
          className="absolute top-full right-0 z-20 mt-1 flex w-60 flex-col gap-2.5 bg-paper p-4"
        >
          <SketchFrame shape="sm" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold break-all">{email}</span>
          </div>
          <SketchLine tone="faint" />
          <LogoutButton className="w-full" />
        </div>
      )}
    </div>
  );
}
