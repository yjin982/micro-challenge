"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { currentPath, signInWithGoogle } from "@/lib/api";
import { LinkConflictDialog } from "./LinkConflictDialog";
import { useStampCount } from "./useStampCount";

// 익명 사용자의 Google 연결·전환이 실패해서 /auth/callback이 하던 화면으로 돌려보냈을 때(?auth_error=코드) 안내한다.
// - identity_already_exists, email_exists: 이미 가입된 Google 계정 → LinkConflict(익명 기록이 없으면 바로 그 계정으로 로그인)
// - access_denied: Google 화면에서 취소 → 아무것도 띄우지 않는다
// - 그 밖: 짧은 안내
// 콜백이 페이지를 새로 열며 돌아오므로 처음 그릴 때의 값만 본다. 새로고침해도 다시 뜨지 않게 주소에서 auth_error를 지운다.
const CONFLICT_CODES = ["identity_already_exists", "email_exists"];

export function AuthReturnNotice() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [code, setCode] = useState(() => {
    const value = params.get("auth_error");
    return value && value !== "access_denied" ? value : null;
  });
  const hasParam = params.has("auth_error");

  useEffect(() => {
    if (!hasParam) return;
    const rest = new URLSearchParams(params);
    rest.delete("auth_error");
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [hasParam, params, pathname, router]);

  if (!code) return null;
  if (CONFLICT_CODES.includes(code)) return <LinkConflict onClose={() => setCode(null)} />;

  return (
    <TopNotice role="alert" tone="error">
      <p className="flex-1">Google 연결을 마치지 못했어요. 잠시 후 다시 시도해 주세요.</p>
      <button type="button" onClick={() => setCode(null)} className="shrink-0 font-bold" aria-label="안내 닫기">
        ✕
      </button>
    </TopNotice>
  );
}

// 이미 가입된 Google 계정을 골라 연결이 실패했을 때. 먼저 익명 기록 수를 확인한다.
// - 0개: 두고 갈 기록이 없으니 묻지 않고 방금 고른 그 계정으로 바로 로그인한다. 계정 선택을 강제하지 않아,
//   브라우저에 Google 계정이 하나만 로그인되어 있으면 다시 고르지 않고 들어간다
// - 1개 이상이거나 수를 모를 때, 바로 로그인을 시작하지 못했을 때: 연결 실패 대화상자로 물어본다
function LinkConflict({ onClose }: { onClose: () => void }) {
  const { count, loaded } = useStampCount();
  const [autoFailed, setAutoFailed] = useState(false);
  const started = useRef(false);
  const autoLogin = loaded && count === 0 && !autoFailed;

  useEffect(() => {
    // 개발 모드에서 효과가 두 번 실행되어도 로그인은 한 번만 시작한다
    if (!autoLogin || started.current) return;
    started.current = true;
    signInWithGoogle(currentPath(), { selectAccount: false }).catch(() => setAutoFailed(true));
  }, [autoLogin]);

  if (!loaded) return null;
  if (autoLogin) {
    return (
      <TopNotice role="status" tone="info">
        <p className="flex-1">이미 가입된 계정이라 그 계정으로 로그인하는 중…</p>
      </TopNotice>
    );
  }
  return <LinkConflictDialog count={count} onClose={onClose} />;
}

// 화면 맨 위의 짧은 안내(시작 화면의 분홍 안내와 같은 모양)
function TopNotice({ role, tone, children }: { role: "alert" | "status"; tone: "error" | "info"; children: ReactNode }) {
  const colors = tone === "error" ? "bg-badge-challenge text-badge-challenge-ink" : "bg-chip-streak text-chip-streak-ink";
  return (
    <div className="fixed inset-x-0 top-3 z-30 px-6">
      <div
        role={role}
        className={`mx-auto flex max-w-108 items-start gap-3 rounded-sketch-sm px-4.5 py-3.5 text-[15px] leading-relaxed ${colors}`}
      >
        {children}
      </div>
    </div>
  );
}
