"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLinkIcon, FeedbackIcon, GearIcon, LinkIcon, LogoutIcon, PersonIcon } from "@/components/ui/icons";
import { SketchLine } from "@/components/ui/sketch";
import { signOutToWelcome } from "@/lib/api";
import { FEEDBACK_URL } from "@/lib/links";
import { Avatar } from "./Avatar";
import type { Account } from "./useAccount";
import { useLinkGoogle } from "./useLinkGoogle";

// 계정 메뉴의 내용(보드: 계정 메뉴 · 익명, 계정 메뉴 · Google). 모바일 햄버거 메뉴와 데스크톱 헤더 메뉴가 함께 쓴다.
// 머리(계정 상태) · (익명이면) Google 계정 연결 · 설정, 피드백 보내기 · 로그아웃.
// - onNavigate: 설정으로 이동하거나 피드백(GitHub Issues, 새 탭)을 열 때 메뉴를 닫는다
// - onRequestLogout: 익명 로그아웃은 기록을 잃으므로 부모가 확인 대화상자를 띄운다. 계정은 바로 로그아웃한다
export function AccountPanel({
  account,
  onNavigate,
  onRequestLogout,
}: {
  account: Account;
  onNavigate: () => void;
  onRequestLogout: () => void;
}) {
  const anonymous = account.kind === "anonymous";

  return (
    <div className="flex flex-col">
      <PanelHeader account={account} />
      <SketchLine tone="faint" className="my-1.5" />
      {anonymous && (
        <>
          <LinkGoogleItem />
          <SketchLine tone="faint" className="my-1.5" />
        </>
      )}
      <Link href="/settings" onClick={onNavigate} className={itemClass}>
        <GearIcon className={iconClass} />
        설정
      </Link>
      <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" onClick={onNavigate} className={itemClass}>
        <FeedbackIcon className={iconClass} />
        <span className="flex-1">피드백 보내기</span>
        <ExternalLinkIcon className="size-4.5 text-ink-faint" />
        <span className="sr-only">(새 탭)</span>
      </a>
      <SketchLine tone="faint" className="my-1.5" />
      <button type="button" onClick={anonymous ? onRequestLogout : signOutToWelcome} className={itemClass}>
        <LogoutIcon className={iconClass} />
        로그아웃
      </button>
    </div>
  );
}

const itemClass = "flex h-12 w-full items-center gap-3 px-1 text-[15px] text-ink";
const iconClass = "size-5.5 shrink-0";

function PanelHeader({ account }: { account: Account }) {
  let picture: ReactNode;
  let title: string;
  let subtitle: string | null;

  if (account.kind === "anonymous") {
    picture = (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-line-faint bg-skeleton text-ink-muted">
        <PersonIcon className="size-5.5" />
      </span>
    );
    title = "익명 사용자";
    subtitle = "기록이 이 기기에만 있어요";
  } else {
    picture = <Avatar name={account.name} email={account.email} url={account.avatarUrl} className="size-11 text-lg" />;
    title = account.provider === "google" ? "Google 계정" : "개발용 테스트 계정";
    subtitle = account.email;
  }

  return (
    <div className="flex items-center gap-3 px-1 pb-1.5">
      {picture}
      <div className="flex min-w-0 flex-col">
        <span className="text-[15px] font-bold">{title}</span>
        {subtitle && <span className="text-[13px] break-all text-ink-muted">{subtitle}</span>}
      </div>
    </div>
  );
}

// 익명 계정에 Google 연결. 성공하면 Google 화면으로 넘어간다.
function LinkGoogleItem() {
  const { link, pending, error } = useLinkGoogle();

  return (
    <>
      <button
        type="button"
        onClick={link}
        disabled={pending}
        className={`${itemClass} font-bold text-primary disabled:opacity-60`}
      >
        <LinkIcon className={iconClass} />
        {pending ? "이동하는 중…" : "Google 계정 연결"}
      </button>
      {error && (
        <span role="alert" className="px-1 pb-1 text-[13px] text-sunday">
          {error}
        </span>
      )}
    </>
  );
}
