import { isAuthApiError } from "@supabase/supabase-js";
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

// 세션의 사용자나 세션 자체가 서버에 없다는 응답(삭제된 사용자 등)
function isStaleSessionError(error: unknown) {
  return (
    isAuthApiError(error) &&
    (error.status === 401 ||
      error.status === 403 ||
      error.code === "user_not_found" ||
      error.code === "session_not_found")
  );
}

// 서버까지 닿지 못한 실패(오프라인, 연결 끊김)인지. 오류 안내 문구를 고를 때 쓴다.
// fetch는 브라우저마다 TypeError("Failed to fetch", "Load failed" 등)로, Supabase 인증은 AuthRetryableFetchError로 알린다.
export function isNetworkError(error: unknown) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (!(error instanceof Error)) return false;
  return (
    error.name === "AuthRetryableFetchError" ||
    (error instanceof TypeError && /fetch|load failed|network/i.test(error.message))
  );
}

// 익명 세션 보장. 동시에 여러 번 불려도(React 개발 모드의 effect 두 번 실행 등) 로그인은 한 번만 한다.
let pendingSession: Promise<void> | null = null;

export function ensureAnonymousSession(): Promise<void> {
  pendingSession ??= (async () => {
    const supabase = createClient();
    // getSession은 만료된 토큰을 갱신해 준다. 갱신도 안 되면 null이라 새 익명 계정을 만든다.
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      // getSession은 브라우저 쿠키만 본다. 대시보드에서 사용자를 지우면 쿠키는 남아 있으므로
      // getUser로 서버에 그 사용자가 아직 있는지 확인하고, 없으면 세션을 버리고 새로 로그인한다.
      const { error } = await supabase.auth.getUser();
      if (!error) return;
      // 네트워크 오류 등은 멀쩡한 세션일 수 있으니 지우지 않고 실패로 돌린다.
      if (!isStaleSessionError(error)) throw error;
      await supabase.auth.signOut({ scope: "local" });
    }
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  })().catch((error) => {
    pendingSession = null; // 실패하면 다음 호출에서 다시 시도
    throw error;
  });
  return pendingSession;
}

// 이메일 계정 로그인(테스트 계정 등). 성공하면 익명 세션 대신 그 계정 세션이 쿠키에 남는다.
// 로그인 전 익명 계정의 기록은 옮겨지지 않는다.
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await createClient().auth.signInWithPassword({ email, password });
  pendingSession = null; // 다음 API 호출에서 바뀐 세션으로 다시 확인
  if (error) throw error;
  return data.user;
}

// Google 로그인(처음이면 가입). Google 화면으로 이동했다가 /auth/callback을 거쳐 next로 돌아온다.
// prompt: select_account로 로그아웃 뒤에도 계정을 고를 수 있게 한다.
// 이동하기 전에 실패하면(Google 제공자 꺼짐 등) 오류를 던진다.
export async function signInWithGoogle(next = "/") {
  const { error } = await createClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw error;
}

// 로그아웃. 다음 API 호출이나 페이지 이동 때 새 익명 계정으로 다시 시작한다.
export async function signOut() {
  await createClient().auth.signOut({ scope: "local" });
  pendingSession = null;
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
