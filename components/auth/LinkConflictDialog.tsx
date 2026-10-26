"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SketchDialog } from "@/components/ui/SketchDialog";
import { currentPath, linkGoogle, signInWithGoogle } from "@/lib/api";
import { GoogleButton } from "./GoogleButton";

// 기록 지키기 실패 · 이미 가입된 Google 계정(보드). 익명 계정에 연결하려던 Google 계정이 이미 다른 사용자라서 돌아왔을 때.
// - 다른 Google 계정으로 연결: 다시 연결(계정 선택 화면이 다시 뜬다)
// - 기존 계정으로 로그인: 그 Google 계정으로 전환한다. 지금 익명 기록은 옮겨지지 않고 더 이상 볼 수 없다
// count: 익명 기록 수(AuthReturnNotice가 불러온 누적 완료 수). 0개거나 모르면(null) 기록 관련 문장을 뺀다.
export function LinkConflictDialog({ count, onClose }: { count: number | null; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <SketchDialog
      mascot={{ src: "/images/mascot/tyrano-thinking.png", width: 144, height: 175 }}
      title="이미 가입된 계정이에요"
      description={
        <>
          이 Google 계정은 이미 가입되어 있어서 지금 기록을 이어 붙일 수 없어요.
          {leftBehind && ` 그 계정으로 로그인하면 지금 익명으로 모은 도장 ${count}개는 더 이상 볼 수 없어요.`}
        </>
      }
      onClose={onClose}
    >
      <div className="mt-1 flex w-full flex-col gap-2.5">
        {/* Google 로그인 화면으로 가는 버튼이라 공식 Google 버튼(2026-10-26 결정, 보드는 초록 버튼) */}
        <GoogleButton onClick={() => go(linkGoogle)} disabled={pending}>
          다른 Google 계정으로 연결
        </GoogleButton>
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
      <button type="button" onClick={onClose} className="px-4 py-2 text-[15px] text-ink-muted">
        닫기
      </button>
    </SketchDialog>
  );
}
