"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/api";

// '다시 뽑기'와 같은 테두리 버튼을 작게 줄인 로그아웃 버튼. 데스크톱 헤더와 모바일 계정 메뉴가 함께 쓴다.
export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  // 로그아웃 뒤에는 화면에 남은 계정 데이터를 버리고 새 익명 계정으로 홈부터 다시 시작한다.
  // 홈으로 옮겨 가면 홈이 새로 마운트되어 다시 불러오고, 이미 홈이면 새로고침한다.
  async function handleSignOut() {
    await signOut();
    if (pathname === "/") window.location.reload();
    else router.push("/");
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
