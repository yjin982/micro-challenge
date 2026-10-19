"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ensureAnonymousSession } from "@/lib/api";

// 앱을 처음 열 때 익명 로그인을 해 둔다. 화면에는 아무것도 그리지 않는다.
// API 호출 도우미도 같은 함수를 부르므로, 여기서 실패해도 첫 API 호출 때 다시 시도한다.
// 로그인 페이지에서는 곧 이메일 계정으로 들어올 수 있어 익명 계정을 미리 만들지 않는다.
export function AnonymousSession() {
  const pathname = usePathname();
  const skip = pathname === "/login";

  useEffect(() => {
    if (skip) return;
    ensureAnonymousSession().catch((error) => console.error("[auth] 익명 로그인 실패", error));
  }, [skip]);
  return null;
}
