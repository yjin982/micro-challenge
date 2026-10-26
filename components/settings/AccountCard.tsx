"use client";

import { Avatar } from "@/components/auth/Avatar";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { Account } from "@/components/auth/useAccount";
import { useLinkGoogle } from "@/components/auth/useLinkGoogle";
import { PersonIcon } from "@/components/ui/icons";
import { SketchFrame } from "@/components/ui/sketch";
import { Skeleton } from "@/components/ui/Skeleton";

// 설정 · 계정 카드(보드: 설정 · Google, 설정 · 익명). account가 null이면 아직 세션을 확인하는 중이다.
// - Google·개발용 이메일: 프로필, 이름, 이메일, 로그아웃, 안내
// - 익명: 안내와 "Google 계정 연결"
export function AccountCard({ account }: { account: Account | null }) {
  return (
    <div aria-busy={account === null} className="relative flex flex-col gap-3 bg-paper px-5 pt-5 pb-4.5">
      <SketchFrame />
      {account === null ? (
        <AccountSkeleton />
      ) : account.kind === "anonymous" ? (
        <AnonymousAccount />
      ) : (
        <SignedInAccount account={account} />
      )}
    </div>
  );
}

function SignedInAccount({ account }: { account: Extract<Account, { kind: "account" }> }) {
  return (
    <>
      <div className="flex items-center gap-3.5">
        <Avatar name={account.name} email={account.email} url={account.avatarUrl} className="size-12 text-xl" />
        <div className="flex min-w-0 flex-1 flex-col">
          {account.name && <span className="text-[17px] font-bold break-all">{account.name}</span>}
          {account.email && <span className="text-sm break-all text-ink-muted">{account.email}</span>}
        </div>
        <LogoutButton />
      </div>
      <p className="text-[13px] leading-relaxed text-ink-muted">
        {account.provider === "google"
          ? "Google 계정으로 로그인됨. 프로필 사진과 이름은 Google 계정 정보를 그대로 써요."
          : "개발용 테스트 계정으로 로그인됨."}
      </p>
    </>
  );
}

function AnonymousAccount() {
  const { link, pending, error } = useLinkGoogle();

  return (
    <>
      <div className="flex items-start gap-3.5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-[1.5px] border-line-faint bg-skeleton text-ink-muted">
          <PersonIcon className="size-6" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-[17px] font-bold">익명 사용자</span>
          <span className="text-[13px] leading-relaxed text-ink-muted">
            기록은 이 기기에만 저장돼요. 브라우저 데이터를 지우면 사라져요.
          </span>
        </div>
      </div>
      <div className="mt-1 flex flex-col gap-1.5">
        {/* 사실상 Google 로그인 버튼이라 보드의 초록 버튼 대신 시작 화면과 같은 공식 버튼을 쓴다(2026-10-26 결정) */}
        <GoogleButton onClick={link} disabled={pending}>
          {pending ? "Google로 이동하는 중…" : "Google 계정 연결"}
        </GoogleButton>
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

function AccountSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3.5">
        <Skeleton className="size-12" rounded="rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4.5 w-24" />
          <Skeleton className="h-3.5 w-40" />
        </div>
      </div>
      <Skeleton className="h-3.5 w-full" />
    </>
  );
}
