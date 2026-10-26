"use client";

import { useRouter } from "next/navigation";
import type { Account } from "@/components/auth/useAccount";
import { useAccount } from "@/components/auth/useAccount";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { AccountCard } from "./AccountCard";
import { AppInfoCard } from "./AppInfoCard";

// 설정(보드: 설정 · Google, 설정 · 익명, 데스크톱 · 설정). 계정 카드, 앱 정보 카드, 맨 아래 삭제.
// 모바일은 제목 왼쪽에 뒤로 가기, 하단 탭은 그대로 둔다(어느 탭도 선택하지 않는다). 데스크톱은 헤더 아래 가운데 열.
export function SettingsView({ version }: { version: string }) {
  const account = useAccount();

  return (
    <main className="mx-auto w-full max-w-120 px-6 pt-5 pb-28 lg:max-w-175 lg:pt-9 lg:pb-12">
      <div className="flex items-center gap-1">
        <BackButton />
        <h1 className="font-hand text-[32px] leading-[1.1] font-bold lg:text-4xl">설정</h1>
      </div>

      <section aria-labelledby="settings-account" className="mt-5 lg:mt-6">
        <h2 id="settings-account" className="mb-2.5 font-hand text-[22px] leading-tight font-bold">
          계정
        </h2>
        <AccountCard account={account} />
      </section>

      <section aria-labelledby="settings-app" className="mt-7">
        <h2 id="settings-app" className="mb-2.5 font-hand text-[22px] leading-tight font-bold">
          앱 정보
        </h2>
        <AppInfoCard version={version} />
      </section>

      <DeleteAccount account={account} />
    </main>
  );
}

// 앱 안에서 넘어왔으면 이전 화면으로, 주소로 바로 들어왔으면(되돌아갈 기록이 없으면) 홈으로 간다.
function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <button
      type="button"
      aria-label="뒤로 가기"
      onClick={handleBack}
      className="-ml-3 flex size-11 items-center justify-center lg:hidden"
    >
      <ChevronLeftIcon className="size-6.5" />
    </button>
  );
}

// 맨 아래 삭제(Google·이메일: 계정 삭제, 익명: 이 기기 기록 모두 지우기).
// 삭제 확인과 실제 삭제는 아직 없어서(로그인 계획 4C단계) 지금은 동작이 없는 버튼으로 둔다.
function DeleteAccount({ account }: { account: Account | null }) {
  if (account === null) {
    return (
      <div aria-hidden className="mt-8 flex flex-col gap-2">
        <Skeleton className="h-4.5 w-24" />
        <Skeleton className="h-3.5 w-64" />
      </div>
    );
  }

  const anonymous = account.kind === "anonymous";
  const description = anonymous
    ? "익명 계정과 모든 기록이 지워지고 되돌릴 수 없어요."
    : account.provider === "google"
      ? "모든 기록이 지워지고 되돌릴 수 없어요. Google 계정 자체는 그대로예요."
      : "모든 기록이 지워지고 되돌릴 수 없어요.";

  return (
    <div className="mt-8 flex flex-col items-start gap-1">
      <button
        type="button"
        className="text-[15px] font-bold text-sunday underline decoration-2 underline-offset-4"
      >
        {anonymous ? "이 기기 기록 모두 지우기" : "계정 삭제"}
      </button>
      <p className="text-[13px] leading-relaxed text-ink-muted">{description}</p>
    </div>
  );
}
