"use client";

import { LogoutButton } from "./LogoutButton";
import { useAccount } from "./useAccount";

// 데스크톱 헤더의 계정 표시. 이메일 계정으로 로그인했을 때만 이메일 전체와 로그아웃 버튼을 보여준다.
// 모바일은 MobileAccountMenu(햄버거 메뉴)가 맡는다.
export function AccountStatus({ className = "" }: { className?: string }) {
  const email = useAccount();
  if (!email) return null;

  return (
    <div className={`flex items-center gap-2 text-[13px] whitespace-nowrap text-ink-muted ${className}`}>
      <span>{email}</span>
      {/* '다시 뽑기'와 같은 테두리 버튼. 헤더의 홈·기록 메뉴보다 조금 작게 */}
      <LogoutButton />
    </div>
  );
}
