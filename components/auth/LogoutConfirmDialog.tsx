"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SketchDialog } from "@/components/ui/SketchDialog";
import { signOutToWelcome } from "@/lib/api";
import { useLinkGoogle } from "./useLinkGoogle";
import { useStampCount } from "./useStampCount";

// 익명 로그아웃 확인(보드: 익명 로그아웃 확인). 익명 계정은 로그아웃하면 다시 들어올 방법이 없어서 한 번 묻는다.
// 맨 아래 "Google 계정 연결"로 기록을 지키는 길도 함께 보여준다.
// 도장 수는 열 때 한 번 불러온다. 0개(또는 불러오기 전)면 도장 수 문장 대신 일반 안내를 쓰고 "두고 가요" 줄을 뺀다.
export function LogoutConfirmDialog({ onClose }: { onClose: () => void }) {
  const count = useStampCount();
  const { link, pending: linking, error: linkError } = useLinkGoogle();
  const [leaving, setLeaving] = useState(false);
  const pending = leaving || linking;
  const leftBehind = count !== null && count > 0;

  // 로그아웃하면 페이지를 새로 열며 시작 화면으로 가므로 leaving을 풀지 않는다
  function handleLogout() {
    setLeaving(true);
    void signOutToWelcome();
  }

  return (
    <SketchDialog
      mascot={{ src: "/images/mascot/tyrano-reading.png", width: 161, height: 164 }}
      title="로그아웃할까요?"
      description={
        leftBehind
          ? `로그아웃하면 이 기기에 익명으로 모은 도장 ${count}개를 다시 볼 수 없어요.`
          : "로그아웃하면 지금 쓰던 익명 계정으로 다시 들어올 수 없어요."
      }
      onClose={onClose}
    >
      <div className="mt-1 flex w-full flex-col gap-2.5">
        <Button onClick={handleLogout} disabled={pending} className="disabled:opacity-60">
          {leaving ? "로그아웃하는 중…" : "로그아웃"}
        </Button>
        {leftBehind && (
          <p className="-mt-1 text-center text-[13px] text-badge-challenge-ink">익명 기록 {count}개는 두고 가요</p>
        )}
        <Button variant="outline" onClick={onClose} disabled={pending}>
          취소
        </Button>
      </div>
      <div className="mt-1 flex flex-col items-center gap-0.5 text-[15px]">
        <span className="text-ink-muted">기록을 지키려면?</span>
        <button
          type="button"
          onClick={link}
          disabled={pending}
          className="font-bold text-primary underline decoration-2 underline-offset-4 disabled:opacity-60"
        >
          {linking ? "이동하는 중…" : "Google 계정 연결"}
        </button>
        {linkError && (
          <span role="alert" className="text-center text-[13px] text-sunday">
            {linkError}
          </span>
        )}
      </div>
    </SketchDialog>
  );
}
