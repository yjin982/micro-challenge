"use client";

import { useId, useState } from "react";
import { SketchFrame } from "@/components/ui/sketch";
import { AccountPanel } from "./AccountPanel";
import { Avatar } from "./Avatar";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";
import { useAccount } from "./useAccount";
import { usePopover } from "./usePopover";

// 데스크톱 헤더의 계정 메뉴. 세션이 없으면 아무것도 그리지 않는다. 모바일은 MobileAccountMenu(햄버거 메뉴)가 맡는다.
// 버튼은 익명이면 "익명 사용자 ⌄", 계정이면 "프로필 사진 + 이름 ⌄"이고, 누르면 모바일과 같은 메뉴(AccountPanel)가 열린다.
// 이메일과 로그아웃은 메뉴 안에 두어 헤더에 항상 드러나지 않게 한다.
export function AccountStatus({ className = "" }: { className?: string }) {
  const account = useAccount();
  const { open, setOpen, rootRef } = usePopover();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const menuId = useId();

  if (!account) return null;

  const signedIn = account.kind === "account";
  const label = signedIn ? (account.name ?? account.email ?? "내 계정") : "익명 사용자";

  return (
    <div className={className}>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-label={signedIn ? `계정 메뉴: ${label}` : undefined}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
          className={`flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-ink-muted bg-paper text-[13px] whitespace-nowrap ${
            signedIn ? "pr-3 pl-1" : "px-4"
          }`}
        >
          {signedIn && (
            <Avatar name={account.name} email={account.email} url={account.avatarUrl} className="size-7 text-xs" />
          )}
          <span className="max-w-40 truncate">{label}</span>
          <svg viewBox="0 0 24 24" aria-hidden className={`size-4 fill-none stroke-current stroke-2 ${open ? "rotate-180" : ""}`}>
            <path d="M6 9 L12 15 L18 9" />
          </svg>
        </button>
        {open && (
          <div id={menuId} className="absolute top-full right-0 z-20 mt-2 w-68 rounded-sketch-sm bg-paper px-4 py-3">
            <SketchFrame shape="sm" />
            <AccountPanel
              account={account}
              onNavigate={() => setOpen(false)}
              onRequestLogout={() => {
                setOpen(false);
                setConfirmLogout(true);
              }}
            />
          </div>
        )}
      </div>
      {confirmLogout && <LogoutConfirmDialog onClose={() => setConfirmLogout(false)} />}
    </div>
  );
}
