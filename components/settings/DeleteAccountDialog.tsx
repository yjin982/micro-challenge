"use client";

import { useState } from "react";
import type { Account } from "@/components/auth/useAccount";
import { Button } from "@/components/ui/Button";
import { SketchDialog } from "@/components/ui/SketchDialog";
import { deleteAccountToWelcome, isNetworkError } from "@/lib/api";
import { GOOGLE_CONNECTIONS_URL } from "@/lib/links";

// 계정 삭제 확인(보드: 계정 삭제 확인). Google·이메일 계정은 "계정을 삭제할까요?",
// 익명은 같은 틀로 "이 기기 기록을 모두 지울까요?"(보드 없음, 로그인 계획 4C단계에서 정한 문구).
// 안내 문구는 도장 수와 관계없이 "모든 기록이 지워지고 되돌릴 수 없어요."로 같다(2026-10-27 결정).
// 열릴 때 포커스는 "취소"에 둔다(첫 버튼이 되돌릴 수 없는 삭제라서). 성공하면 페이지를 새로 열며 시작 화면으로 간다.
export function DeleteAccountDialog({ account, onClose }: { account: Account; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const anonymous = account.kind === "anonymous";
  const google = account.kind === "account" && account.provider === "google";
  const description = `모든 기록이 지워지고 되돌릴 수 없어요.${google ? " Google 계정 자체는 그대로예요." : ""}`;

  // 성공하면 시작 화면으로 페이지가 바뀌므로 pending을 풀지 않는다
  async function handleDelete() {
    setPending(true);
    setError(null);
    try {
      await deleteAccountToWelcome();
    } catch (reason) {
      setError(
        isNetworkError(reason)
          ? "인터넷 연결을 확인하고 다시 시도해 주세요."
          : "삭제하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
      setPending(false);
    }
  }

  return (
    <SketchDialog
      mascot={{ src: "/images/mascot/tyrano-sad.png", width: 150, height: 161 }}
      title={anonymous ? "이 기기 기록을 모두 지울까요?" : "계정을 삭제할까요?"}
      description={description}
      onClose={onClose}
    >
      <div className="mt-1 flex w-full flex-col gap-2.5">
        <Button variant="danger" onClick={handleDelete} disabled={pending} className="disabled:opacity-60">
          {pending ? "삭제하는 중…" : anonymous ? "모두 지우기" : "계정 삭제"}
        </Button>
        <Button variant="outline" onClick={onClose} disabled={pending} data-autofocus>
          취소
        </Button>
        {error && (
          <p role="alert" className="text-center text-[13px] text-sunday">
            {error}
          </p>
        )}
      </div>
      {/* Google 쪽 연결은 끊지 않으므로(기본안) 원하면 직접 끊을 수 있게 안내한다(보드에는 없다) */}
      {google && (
        <p className="text-center text-[13px] leading-relaxed text-ink-muted">
          Google 계정 설정에서{" "}
          <a
            href={GOOGLE_CONNECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            이 앱과의 연결
            <span className="sr-only">(새 탭)</span>
          </a>
          도 끊을 수 있어요.
        </p>
      )}
    </SketchDialog>
  );
}
