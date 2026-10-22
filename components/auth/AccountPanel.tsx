"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SketchLine } from "@/components/ui/sketch";
import { currentPath, linkGoogle } from "@/lib/api";
import { Avatar } from "./Avatar";
import { LogoutButton } from "./LogoutButton";
import type { Account } from "./useAccount";

// 계정 메뉴의 내용. 모바일 햄버거 메뉴와 데스크톱 헤더의 "익명으로 사용 중" 메뉴가 함께 쓴다.
// - 익명: 기록이 이 기기에만 있다는 안내와 "Google로 기록 지키기"(익명 계정에 Google 연결). 로그아웃은 두지 않는다(누르면 기록을 잃는다)
// - 계정: 프로필, 이름, 이메일, 안내, 로그아웃
export function AccountPanel({ account }: { account: Account }) {
  if (account.kind === "anonymous") return <AnonymousPanel />;

  const google = account.provider === "google";
  return (
    <>
      <div className="flex items-center gap-3">
        <Avatar name={account.name} email={account.email} url={account.avatarUrl} />
        <div className="flex min-w-0 flex-col">
          {account.name && <span className="text-[15px] font-bold break-all">{account.name}</span>}
          {account.email && <span className="text-[13px] break-all text-ink-muted">{account.email}</span>}
        </div>
      </div>
      <p className="text-[13px] leading-relaxed text-ink-muted">
        {google
          ? "Google 계정으로 로그인됨. 다른 기기에서도 같은 기록을 볼 수 있어요."
          : "개발용 테스트 계정으로 로그인됨."}
      </p>
      <SketchLine tone="faint" />
      <LogoutButton className="w-full" />
    </>
  );
}

function AnonymousPanel() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 성공하면 Google 화면으로 넘어가므로 pending을 풀지 않는다. 연결이 끝나면 지금 화면으로 돌아온다.
  async function handleLink() {
    setPending(true);
    setError(null);
    try {
      await linkGoogle(currentPath());
    } catch {
      setError("Google 연결을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setPending(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-bold">익명으로 사용 중</span>
        <span className="text-[13px] leading-relaxed text-ink-muted">
          기록은 이 기기에만 저장돼요. 브라우저 데이터를 지우면 사라져요.
        </span>
      </div>
      <SketchLine tone="faint" />
      <div className="flex flex-col gap-1.5">
        <Button onClick={handleLink} disabled={pending} className="disabled:opacity-60">
          {pending ? "이동하는 중…" : "Google로 기록 지키기"}
        </Button>
        <span className="text-center text-[13px] text-ink-muted">지금까지의 기록이 그대로 이어져요</span>
        {error && (
          <span role="alert" className="text-center text-[13px] text-sunday">
            {error}
          </span>
        )}
      </div>
    </>
  );
}
