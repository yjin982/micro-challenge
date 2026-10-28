"use client";

import { MotionConfig } from "motion/react";
import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";
import { ApiError, api, isNetworkError } from "@/lib/api";
import { useDayCheck, useServerDateSync } from "@/lib/useDaySync";
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
  // 뽑기·재뽑기 요청. 시작했으면 true. 이미 다른 요청이 진행 중이면 false(스와이프한 카드를 제자리로 돌릴 때 쓴다)
  run: (action: Exclude<Action, "complete">) => boolean;
  // 메모와 함께 완료(메모 대화상자의 '완료하기'). 성공하거나 409(다른 탭·자정)로 상태를 다시 맞췄으면 끝나고,
  // 그 밖의 실패(인터넷 등)는 오류를 던진다. 메모 대화상자가 받아서 닫지 않고 안내한다
  complete: (note: string) => Promise<void>;
  // 완료 화면에서 연속 달성 화면으로 넘어간다
  showStreak: () => void;
};

const TodayContext = createContext<TodayContextValue | null>(null);

const calls = { draw: api.draw, reroll: api.reroll };

// '미션 꺼내는 중'이 한순간 깜빡이고 사라지지 않도록 뽑기·재뽑기는 이만큼은 보여준다.
const MIN_DRAW_MS = 700;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 409 응답 안내. 상태는 서버의 현재 값으로 다시 맞춘 뒤라 '다시 해 달라'는 말은 넣지 않는다.
function conflictMessage(error: ApiError) {
  if (error.code === "DAY_CHANGED") return "날짜가 바뀌어서 오늘 상태를 새로 불러왔어요.";
  return `${error.message} 지금 상태로 다시 불러왔어요.`;
}

// 홈 화면이 함께 쓰는 오늘 상태와 뽑기·재뽑기·완료 요청.
// 브라우저에서 /api를 불러온다(서버에서 바로 읽는 방식은 로그인 개편 계획의 8단계, 선택).
// serverDate는 서버가 페이지를 그릴 때 쓴 날짜(getToday)다. API 날짜와 다르면 서버 부분을 새로 그린다.
export function TodayProvider({ serverDate, children }: { serverDate: string; children: ReactNode }) {
  const [today, setToday] = useState<TodayState | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [pending, setPending] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  // 같은 순간 두 번 눌러도(스와이프 직후 탭 등) 요청은 하나만 보낸다. pending 상태는 다음 렌더에야 바뀌어서 따로 둔다.
  const busy = useRef(false);

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

  // API 날짜가 기준이다. 서버가 그린 헤더 날짜·달력의 달·공휴일이 그와 다르면(자정 무렵) 새로 그린다.
  useServerDateSync(serverDate, today?.date);

  // 화면에 돌아오거나 자정이 지나면 오늘 상태를 다시 불러온다. 날짜가 바뀌었으면 어제의 완료 화면·안내는 접는다.
  // 다른 탭에서 뽑거나 완료한 것도 이때 반영된다.
  useDayCheck(async () => {
    if (!today || busy.current) return;
    try {
      const next = await api.getToday();
      if (busy.current) return; // 그사이 시작된 요청이 있으면 그 결과를 따른다
      if (next.date !== today.date) {
        setJustCompleted(false);
        setActionError(null);
      }
      setToday(next);
    } catch (reason) {
      console.error("[home] 오늘 상태 다시 확인 실패", reason); // 다음 확인 때 다시 한다
    }
  });

  function run(action: Exclude<Action, "complete">) {
    if (!today || busy.current) return false;
    busy.current = true;
    void request(action, today.date);
    return true;
  }

  // 다른 탭에서 먼저 바꿨거나 자정이 지난 경우(409): 서버의 지금 상태로 맞춘다.
  // 날짜가 바뀌었으면 useServerDateSync가 서버에서 그린 헤더 날짜·달력도 새로 그린다.
  async function resync(reason: ApiError) {
    setActionError(conflictMessage(reason));
    try {
      setToday(await api.getToday());
    } catch {
      // 다시 불러오기도 실패하면 안내만 남기고 지금 화면을 둔다.
    }
  }

  async function complete(note: string) {
    if (!today || busy.current) return;
    busy.current = true;
    setPending("complete");
    setActionError(null);
    try {
      setToday(await api.complete(today.date, note));
      setJustCompleted(true);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 409) {
        await resync(reason);
        return;
      }
      console.error("[home] complete 요청 실패", reason);
      throw reason;
    } finally {
      busy.current = false;
      setPending(null);
    }
  }

  async function request(action: Exclude<Action, "complete">, date: string) {
    setPending(action);
    setActionError(null);
    try {
      const [next] = await Promise.all([calls[action](date), wait(MIN_DRAW_MS)]);
      setToday(next);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 409) {
        await resync(reason);
      } else {
        console.error(`[home] ${action} 요청 실패`, reason);
        setActionError(
          isNetworkError(reason)
            ? "인터넷 연결을 확인하고 다시 시도해 주세요."
            : "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.",
        );
      }
    } finally {
      busy.current = false;
      setPending(null);
    }
  }

  // 불러오기 실패는 렌더링 중에 다시 던져 app/error.tsx의 오류 화면으로 넘긴다.
  // '다시 시도'를 누르면 이 컴포넌트가 새로 마운트되어 다시 불러온다.
  if (error) throw error;

  return (
    <TodayContext
      value={{ today, pending, actionError, justCompleted, run, complete, showStreak: () => setJustCompleted(false) }}
    >
      {/* 동작 줄이기 설정이면 움직임(위치·크기·회전)은 건너뛰고 투명도만 바꾼다 */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
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
