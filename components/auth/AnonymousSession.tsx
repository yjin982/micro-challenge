"use client";

import { useEffect } from "react";
import { ensureAnonymousSession } from "@/lib/api";

// 앱을 처음 열 때 익명 로그인을 해 둔다(로그인 화면 없음). 화면에는 아무것도 그리지 않는다.
// API 호출 도우미도 같은 함수를 부르므로, 여기서 실패해도 첫 API 호출 때 다시 시도한다.
export function AnonymousSession() {
  useEffect(() => {
    ensureAnonymousSession().catch((error) => console.error("[auth] 익명 로그인 실패", error));
  }, []);
  return null;
}
