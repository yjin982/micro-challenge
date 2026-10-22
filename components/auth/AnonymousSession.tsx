"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isAuthScreen } from "@/components/nav/nav-items";
import { ensureAnonymousSession } from "@/lib/api";

// 앱을 처음 열 때 익명 로그인을 해 둔다. 화면에는 아무것도 그리지 않는다.
// API 호출 도우미도 같은 함수를 부르므로, 여기서 실패해도 첫 API 호출 때 다시 시도한다.
// 시작·로그인 화면에서는 사용자가 고르기 전이라 익명 계정을 미리 만들지 않는다.
// (로그인 개편 3단계에서 이 컴포넌트를 지우고 시작 화면의 "익명으로 시작하기"만 익명 계정을 만든다)
export function AnonymousSession() {
  const pathname = usePathname();
  const skip = isAuthScreen(pathname);

  useEffect(() => {
    if (skip) return;
    ensureAnonymousSession().catch((error) => console.error("[auth] 익명 로그인 실패", error));
  }, [skip]);
  return null;
}
