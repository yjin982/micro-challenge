import { createClient } from "@/lib/supabase/client";
import type { ApiErrorBody, ErrorCode, MonthRecords, TodayState } from "@/types/api";

// 브라우저에서 쓰는 API 호출 도우미. 익명 로그인과 401 재시도를 여기서 맡는다.

export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

// 익명 세션 보장. 동시에 여러 번 불려도(React 개발 모드의 effect 두 번 실행 등) 로그인은 한 번만 한다.
let pendingSession: Promise<void> | null = null;

export function ensureAnonymousSession(): Promise<void> {
  pendingSession ??= (async () => {
    const supabase = createClient();
    // getSession은 만료된 토큰을 갱신해 준다. 갱신도 안 되면 null이라 새 익명 계정을 만든다.
    const { data } = await supabase.auth.getSession();
    if (data.session) return;
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  })().catch((error) => {
    pendingSession = null; // 실패하면 다음 호출에서 다시 시도
    throw error;
  });
  return pendingSession;
}

async function request<T>(path: string, init?: RequestInit, retried = false): Promise<T> {
  await ensureAnonymousSession();
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (res.ok) return res.json();

  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  const code = body?.error.code ?? "INTERNAL";
  // 세션이 사라졌으면 다시 확인(필요하면 익명 로그인)한 뒤 한 번만 재시도한다.
  if (code === "UNAUTHENTICATED" && !retried) {
    pendingSession = null;
    return request(path, init, true);
  }
  throw new ApiError(code, body?.error.message ?? res.statusText, res.status);
}

const post = (path: string, date: string) =>
  request<TodayState>(path, { method: "POST", body: JSON.stringify({ date }) });

export const api = {
  getToday: () => request<TodayState>("/api/today"),
  // date는 getToday가 돌려준 date를 그대로 보낸다. 서버 날짜와 다르면 DAY_CHANGED.
  draw: (date: string) => post("/api/today/draw", date),
  reroll: (date: string) => post("/api/today/reroll", date),
  complete: (date: string) => post("/api/today/complete", date),
  getMonth: (month: string) => request<MonthRecords>(`/api/records?month=${month}`),
};
