"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CardTape } from "@/components/home/CardStack";
import { Button } from "@/components/ui/Button";
import { Doodle } from "@/components/ui/Doodle";
import { SketchFrame } from "@/components/ui/sketch";
import { isNetworkError, signInWithGoogle, startAnonymous } from "@/lib/api";
import { GoogleButton } from "./GoogleButton";

// 시작 화면(세션이 없을 때). 익명으로 시작하거나 Google 계정으로 계속한다.
// 모바일은 위에 마스코트·소개, 아래에 버튼. 데스크톱은 가운데 카드의 왼쪽에 마스코트, 오른쪽에 소개와 버튼.
// next: 시작한 뒤 돌아갈 경로(safeNext로 검사한 값). authError: Google 로그인이 실패·취소되어 돌아왔을 때.
export function Welcome({
  next,
  authError,
  devLogin,
}: {
  next: string;
  authError: boolean;
  devLogin: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"anonymous" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnonymous() {
    setPending("anonymous");
    setError(null);
    try {
      await startAnonymous();
      router.replace(next);
    } catch (reason) {
      setError(
        isNetworkError(reason)
          ? "인터넷 연결을 확인하고 다시 시도해 주세요."
          : "시작하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
      setPending(null);
    }
  }

  // 성공하면 Google 화면으로 넘어가므로 pending을 풀지 않는다.
  async function handleGoogle() {
    setPending("google");
    setError(null);
    try {
      await signInWithGoogle(next);
    } catch {
      setError("Google 로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setPending(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col px-6 pt-7 pb-10 lg:min-h-0 lg:max-w-232 lg:pt-12 lg:pb-12">
      {authError && (
        <p
          role="alert"
          className="mb-4 rounded-sketch-sm bg-badge-challenge px-4.5 py-3.5 text-[15px] leading-relaxed text-badge-challenge-ink lg:mx-auto lg:mb-6 lg:w-220"
        >
          Google 로그인을 마치지 못했어요. 다시 시도하거나 익명으로 먼저 시작해 보세요.
        </p>
      )}

      <div className="flex flex-1 flex-col lg:relative lg:mx-auto lg:w-220 lg:flex-none lg:flex-row lg:items-center lg:bg-paper lg:py-12 lg:pr-14 lg:pl-10">
        {/* 데스크톱 카드의 테두리와 테이프 */}
        <div className="hidden lg:contents">
          <SketchFrame />
          <CardTape />
        </div>

        <div className="flex justify-center pt-8 lg:flex-1 lg:pt-0">
          <div className="relative w-45 lg:w-55">
            <Image
              src="/images/mascot/tyrano-stretching.png"
              alt=""
              width={186}
              height={169}
              loading="eager"
              draggable={false}
              className="h-auto w-full"
            />
            <Doodle name="sparkle" className="absolute -top-2 -left-6 size-7 lg:-top-3 lg:-left-8 lg:size-9" />
            <Doodle name="star" className="absolute -top-6.5 -right-4 size-5.5 lg:-top-8 lg:-right-5 lg:size-7" />
            <Doodle name="star-orange" className="absolute top-7 right-1.5 size-3.5 lg:top-9 lg:size-4.5" />
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:w-103 lg:flex-none">
          <div className="mt-6 flex flex-col items-center gap-3 text-center lg:mt-0 lg:items-start lg:text-left">
            <h1 className="font-hand text-[40px] leading-none font-bold lg:text-[44px]">밍기적 챌린지</h1>
            <p className="font-hand text-2xl leading-tight font-bold lg:text-[26px]">오늘 일으킬 아주 작은 기적</p>
            <p className="text-[15px] leading-relaxed text-ink-muted">
              하루 1개, 아주 작은 미션을 뽑아 해내고
              <br className="lg:hidden" /> 도장을 모으는 그림일기 챌린지
            </p>
          </div>

          <div className="mt-auto flex flex-col pt-10 lg:mt-7 lg:pt-0">
            <Button font="sans" onClick={handleAnonymous} disabled={pending !== null} className="disabled:opacity-60">
              {pending === "anonymous" ? "시작하는 중…" : "익명으로 시작하기"}
            </Button>
            <p className="mt-2 text-center text-[13px] text-ink-muted lg:text-left">
              로그인 없이 바로 써요. 기록은 이 기기에만 저장돼요.
            </p>

            {/* 모바일만 '또는' 구분선. 데스크톱 보드는 버튼 사이를 그냥 띄운다 */}
            <div aria-hidden className="my-4 flex items-center gap-3 text-[13px] text-ink-faint lg:hidden">
              <span className="h-px flex-1 bg-line-faint" />
              또는
              <span className="h-px flex-1 bg-line-faint" />
            </div>

            <GoogleButton onClick={handleGoogle} disabled={pending !== null} className="lg:mt-4">
              {pending === "google" ? "Google로 이동하는 중…" : "Google 계정으로 계속"}
            </GoogleButton>
            <p className="mt-2 text-center text-[13px] text-ink-muted lg:text-left">
              가입과 로그인이 한 번에 돼요. 다른 기기에서도 기록을 이어 봐요.
            </p>

            {error && (
              <p role="alert" className="mt-3 text-center text-[13px] text-sunday lg:text-left">
                {error}
              </p>
            )}

            {/* 개발 환경에서만: 테스트 계정 이메일 로그인 */}
            {devLogin && (
              <Link
                href={`/login?next=${encodeURIComponent(next)}`}
                className="mt-5 self-center text-xs text-ink-faint underline underline-offset-2 lg:self-start"
              >
                개발용 이메일 로그인
              </Link>
            )}

            {/* Google 로그인 브랜딩은 홈페이지에서 처리방침으로 가는 링크를 요구한다(보드에는 없다) */}
            <p className="mt-5 flex justify-center gap-2 text-xs text-ink-muted lg:justify-start">
              <Link href="/privacy" className="underline underline-offset-2">
                개인정보처리방침
              </Link>
              <span aria-hidden>·</span>
              <Link href="/terms" className="underline underline-offset-2">
                서비스 이용약관
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
