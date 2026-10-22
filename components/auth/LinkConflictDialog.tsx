"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SketchFrame } from "@/components/ui/sketch";
import { api, currentPath, linkGoogle, signInWithGoogle } from "@/lib/api";

// 기록 지키기 실패 · 이미 가입된 Google 계정(보드). 익명 계정에 연결하려던 Google 계정이 이미 다른 사용자라서 돌아왔을 때.
// - 다른 Google 계정으로 연결: 다시 기록 지키기(계정 선택 화면이 다시 뜬다)
// - 기존 계정으로 로그인: 그 Google 계정으로 전환한다. 지금 익명 기록은 옮겨지지 않고 더 이상 볼 수 없다
// 익명 기록 수는 대화상자를 열 때 오늘 상태(누적 완료 수)를 한 번 불러와 쓴다. 0개면 기록 관련 문장을 뺀다.
export function LinkConflictDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [count, setCount] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    api
      .getToday()
      .then((today) => setCount(today.totalCompleted))
      .catch(() => setCount(null));
  }, []);

  // 성공하면 Google 화면으로 넘어가므로 pending을 풀지 않는다
  async function go(action: (next: string) => Promise<void>) {
    setPending(true);
    setError(null);
    try {
      await action(currentPath());
    } catch {
      setError("Google로 이동하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setPending(false);
    }
  }

  const leftBehind = count !== null && count > 0;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="link-conflict-title"
      className="m-auto w-[calc(100%-48px)] max-w-87 overflow-visible bg-transparent p-0 backdrop:bg-ink/40"
    >
      {/* 어두운 배경 위라 바탕도 테두리처럼 둥글려야 모서리가 비치지 않는다 */}
      <div className="relative flex flex-col items-center gap-3 rounded-sketch bg-paper px-6 pt-7 pb-5">
        <SketchFrame />
        <Image src="/images/mascot/tyrano-thinking.png" alt="" width={144} height={175} className="h-auto w-30" />
        <h2 id="link-conflict-title" className="font-hand text-[28px] leading-tight font-bold">
          이미 가입된 계정이에요
        </h2>
        <p className="text-center text-[15px] leading-relaxed text-ink-muted">
          이 Google 계정은 이미 가입되어 있어서 지금 기록을 이어 붙일 수 없어요.
          {leftBehind && ` 그 계정으로 로그인하면 지금 익명으로 모은 도장 ${count}개는 더 이상 볼 수 없어요.`}
        </p>
        <div className="mt-1 flex w-full flex-col gap-2.5">
          <Button onClick={() => go(linkGoogle)} disabled={pending} className="disabled:opacity-60">
            다른 Google 계정으로 연결
          </Button>
          <Button variant="outline" onClick={() => go(signInWithGoogle)} disabled={pending}>
            기존 계정으로 로그인
          </Button>
          {leftBehind && (
            <p className="-mt-1 text-center text-[13px] text-badge-challenge-ink">익명 기록 {count}개는 두고 가요</p>
          )}
          {error && (
            <p role="alert" className="text-center text-[13px] text-sunday">
              {error}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="px-4 py-2 text-[15px] text-ink-muted"
        >
          닫기
        </button>
      </div>
    </dialog>
  );
}
