"use client";

import { signOutToWelcome } from "@/lib/api";

// '다시 뽑기'와 같은 테두리 버튼을 작게 줄인 로그아웃 버튼. 설정의 계정 카드가 쓴다(계정 메뉴는 목록 항목).
export function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={signOutToWelcome}
      className={`flex h-8.5 shrink-0 items-center justify-center rounded-sketch-btn border-2 border-ink-muted bg-paper px-3.5 font-hand text-lg leading-none font-bold whitespace-nowrap text-ink ${className}`}
    >
      로그아웃
    </button>
  );
}
