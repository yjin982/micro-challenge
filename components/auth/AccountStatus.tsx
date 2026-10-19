"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/api";
import { useAccount } from "./useAccount";

// 이메일 계정으로 로그인했을 때만 계정 이메일과 로그아웃 버튼을 보여준다. 익명이면 아무것도 그리지 않는다.
export function AccountStatus({ className = "" }: { className?: string }) {
  const email = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  if (!email) return null;

  // 로그아웃 뒤에는 화면에 남은 계정 데이터를 버리고 새 익명 계정으로 홈부터 다시 시작한다.
  // 홈으로 옮겨 가면 홈이 새로 마운트되어 다시 불러오고, 이미 홈이면 새로고침한다.
  async function handleSignOut() {
    await signOut();
    if (pathname === "/") window.location.reload();
    else router.push("/");
  }

  return (
    <div className={`flex min-w-0 items-center gap-2 text-[13px] text-ink-muted ${className}`}>
      <span className="truncate" title={email}>
        {email}
      </span>
      {/* '다시 뽑기'와 같은 테두리 버튼. 헤더의 홈·기록 메뉴보다 조금 작게 */}
      <button
        type="button"
        onClick={handleSignOut}
        className="flex h-8.5 shrink-0 items-center rounded-sketch-btn border-2 border-ink-muted bg-paper px-3.5 font-hand text-lg leading-none font-bold whitespace-nowrap text-ink"
      >
        로그아웃
      </button>
    </div>
  );
}
