"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { ApiError, api } from "@/lib/api";
import type { TodayState } from "@/types/api";

type Action = "draw" | "reroll" | "complete";

type TodayContextValue = {
  // GET /api/today 결과. 불러오기 전에는 null
  today: TodayState | null;
  // 진행 중인 요청(뽑기·재뽑기·완료). 그동안 버튼을 막는다
  pending: Action | null;
  // 마지막 요청이 실패했을 때 버튼 아래에 보여줄 안내
  actionError: string | null;
  // 이 화면에서 방금 완료했는지. 모바일은 완료 화면을 먼저 보여주고, 다시 들어오면 바로 연속 달성 화면이다
  justCompleted: boolean;
  run: (action: Action) => void;
  // 완료 화면에서 연속 달성 화면으로 넘어간다
  showStreak: () => void;
};

const TodayContext = createContext<TodayContextValue | null>(null);

const calls = { draw: api.draw, reroll: api.reroll, complete: api.complete };

// '미션 꺼내는 중'이 한순간 깜빡이고 사라지지 않도록 뽑기·재뽑기는 이만큼은 보여준다.
const MIN_DRAW_MS = 700;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 409 응답 안내. 상태는 서버의 현재 값으로 다시 맞춘 뒤라 '다시 해 달라'는 말은 넣지 않는다.
function conflictMessage(error: ApiError) {
  if (error.code === "DAY_CHANGED") return "날짜가 바뀌어서 오늘 상태를 새로 불러왔어요.";
  return `${error.message} 지금 상태로 다시 불러왔어요.`;
}

// 홈 화면이 함께 쓰는 오늘 상태와 뽑기·재뽑기·완료 요청.
// 익명 세션이 브라우저에서 만들어지므로 서버 렌더링이 아니라 브라우저에서 불러온다.
export function TodayProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [today, setToday] = useState<TodayState | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

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

  async function run(action: Action) {
    if (!today || pending) return;
    setPending(action);
    setActionError(null);
    try {
      const [next] = await Promise.all([calls[action](today.date), action === "complete" ? null : wait(MIN_DRAW_MS)]);
      setToday(next);
      if (action === "complete") setJustCompleted(true);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 409) {
        // 다른 탭에서 먼저 바꿨거나 자정이 지난 경우: 서버의 지금 상태로 맞춘다.
        setActionError(conflictMessage(reason));
        try {
          setToday(await api.getToday());
        } catch {
          // 다시 불러오기도 실패하면 안내만 남기고 지금 화면을 둔다.
        }
        // 날짜가 바뀌면 서버에서 그린 헤더 날짜·달력도 새로 그린다.
        if (reason.code === "DAY_CHANGED") router.refresh();
      } else {
        console.error(`[home] ${action} 요청 실패`, reason);
        setActionError("요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setPending(null);
    }
  }

  // 불러오기 실패는 렌더링 중에 다시 던져 app/error.tsx의 오류 화면으로 넘긴다.
  // '다시 시도'를 누르면 이 컴포넌트가 새로 마운트되어 다시 불러온다.
  if (error) throw error;

  return (
    <TodayContext
      value={{ today, pending, actionError, justCompleted, run, showStreak: () => setJustCompleted(false) }}
    >
      {children}
    </TodayContext>
  );
}

function useTodayContext() {
  const value = use(TodayContext);
  if (!value) throw new Error("TodayProvider 안에서만 쓸 수 있어요.");
  return value;
}

// 오늘 상태만 필요할 때(칩, 남은 재뽑기, 최근 기록, 달력)
export function useToday() {
  return useTodayContext().today;
}

// 버튼과 화면 전환에 필요한 요청 상태까지
export function useTodayActions() {
  return useTodayContext();
}
