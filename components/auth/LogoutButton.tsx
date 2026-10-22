"use client";

import { signOut } from "@/lib/api";

// '다시 뽑기'와 같은 테두리 버튼을 작게 줄인 로그아웃 버튼. 데스크톱 헤더와 모바일 계정 메뉴가 함께 쓴다.
export function LogoutButton({ className = "" }: { className?: string }) {
  // 로그아웃 뒤에는 화면에 남은 계정 데이터를 버리도록 페이지를 새로 열어 시작 화면으로 간다.
  async function handleSignOut() {
    await signOut();
    window.location.assign(new URL("/welcome", window.location.origin));
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={`flex h-8.5 shrink-0 items-center justify-center rounded-sketch-btn border-2 border-ink-muted bg-paper px-3.5 font-hand text-lg leading-none font-bold whitespace-nowrap text-ink ${className}`}
    >
      로그아웃
    </button>
  );
}
