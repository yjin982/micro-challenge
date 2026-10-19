"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { TodayState } from "@/types/api";

// 홈 화면이 함께 쓰는 오늘 상태(GET /api/today). 불러오기 전에는 null이고, 그동안 각 영역은 스켈레톤을 보여준다.
// 익명 세션이 브라우저에서 만들어지므로 서버 렌더링이 아니라 브라우저에서 불러온다.
const TodayContext = createContext<TodayState | null>(null);

export function TodayProvider({ children }: { children: ReactNode }) {
  const [today, setToday] = useState<TodayState | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    api
      .getToday()
      .then((state) => {
        if (active) setToday(state);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason);
      });
    return () => {
      active = false;
    };
  }, []);

  // 불러오기 실패는 렌더링 중에 다시 던져 app/error.tsx의 오류 화면으로 넘긴다.
  // '다시 시도'를 누르면 이 컴포넌트가 새로 마운트되어 다시 불러온다.
  if (error) throw error;

  return <TodayContext value={today}>{children}</TodayContext>;
}

export function useToday() {
  return use(TodayContext);
}
