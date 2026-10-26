"use client";

import { useState } from "react";
import { currentPath, linkGoogle } from "@/lib/api";

// "Google 계정 연결"(익명 계정에 Google 연결). 계정 메뉴와 설정 화면이 함께 쓴다.
// 성공하면 Google 화면으로 넘어가므로 pending을 풀지 않는다. 연결이 끝나면 지금 화면으로 돌아온다.
export function useLinkGoogle() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function link() {
    setPending(true);
    setError(null);
    try {
      await linkGoogle(currentPath());
    } catch {
      setError("Google 연결을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setPending(false);
    }
  }

  return { link, pending, error };
}
