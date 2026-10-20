"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent } from "react";

// 날짜는 서버(DB kst_day())만 정한다. 화면은 아래 두 가지 신호로 "오늘이 바뀌었는지" 서버에 다시 물어볼 뿐이다.

const DAY_MS = 86_400_000;
// 한국 시간(UTC+9)에서 자정 1분 유예를 뺀 만큼 당기면, 하루 경계가 UTC 자정과 같아진다
const SHIFT_MS = 9 * 3_600_000 - 60_000;
// 기기 시계가 서버보다 조금 빨라도 경계를 넘긴 뒤에 묻도록 두는 여유
const MARGIN_MS = 5_000;

// 다음 하루 경계(한국 시간 00:01)까지 남은 시간. 다시 물어볼 때를 정하는 데만 쓴다.
function msUntilNextDay() {
  const now = Date.now();
  const next = (Math.floor((now + SHIFT_MS) / DAY_MS) + 1) * DAY_MS - SHIFT_MS;
  return next - now + MARGIN_MS;
}

// 화면에 다시 돌아왔을 때와 하루 경계가 지났을 때 check를 부른다(자정을 넘겨 켜 둔 화면 대비).
export function useDayCheck(check: () => void) {
  const onCheck = useEffectEvent(check);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        onCheck();
        schedule();
      }, msUntilNextDay());
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") onCheck();
    };

    schedule();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}

// 서버 컴포넌트가 그린 날짜(헤더 날짜, 달력의 달, 공휴일)는 lib/today.ts의 getToday()로 계산한 값이다.
// API가 준 오늘(apiDate)과 다르면 서버 부분을 새로 그려 맞춘다.
// 서버끼리 시계가 계속 어긋나도 새로고침이 되풀이되지 않도록 같은 날짜로는 한 번만 한다(페이지를 옮겨도 유지).
let refreshedFor: string | null = null;

export function useServerDateSync(serverDate: string, apiDate: string | undefined) {
  const router = useRouter();

  useEffect(() => {
    if (!apiDate || apiDate === serverDate || refreshedFor === apiDate) return;
    refreshedFor = apiDate;
    router.refresh();
  }, [apiDate, serverDate, router]);
}
