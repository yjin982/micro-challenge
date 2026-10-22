"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LinkConflictDialog } from "./LinkConflictDialog";

// 익명 사용자의 Google 연결·전환이 실패해서 /auth/callback이 하던 화면으로 돌려보냈을 때(?auth_error=코드) 안내한다.
// - identity_already_exists, email_exists: 이미 가입된 Google 계정 → 연결 실패 대화상자
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
  if (CONFLICT_CODES.includes(code)) return <LinkConflictDialog onClose={() => setCode(null)} />;

  return (
    <div className="fixed inset-x-0 top-3 z-30 px-6">
      <div
        role="alert"
        className="mx-auto flex max-w-108 items-start gap-3 rounded-sketch-sm bg-badge-challenge px-4.5 py-3.5 text-[15px] leading-relaxed text-badge-challenge-ink"
      >
        <p className="flex-1">Google 연결을 마치지 못했어요. 잠시 후 다시 시도해 주세요.</p>
        <button type="button" onClick={() => setCode(null)} className="shrink-0 font-bold" aria-label="안내 닫기">
          ✕
        </button>
      </div>
    </div>
  );
}
