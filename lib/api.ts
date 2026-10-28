import { createClient } from "@/lib/supabase/client";
import type { ApiErrorBody, DeleteAccountResult, ErrorCode, MonthRecords, NoteResult, TodayState } from "@/types/api";

// 브라우저에서 쓰는 API 호출 도우미와 로그인 함수. 세션은 시작 화면에서 만들고(익명 또는 Google),
// API가 세션이 없다고(401) 하면 쿠키를 지우고 시작 화면으로 보낸다.

export class ApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
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

// 시작 화면의 "익명으로 시작하기". 새 익명 계정을 만든다(익명 계정은 이 버튼으로만 만든다).
export async function startAnonymous() {
  const { error } = await createClient().auth.signInAnonymously();
  if (error) throw error;
}

// Google 로그인(처음이면 가입). Google 화면으로 이동했다가 /auth/callback을 거쳐 next로 돌아온다.
// 기본은 prompt: select_account로 로그아웃 뒤에도 계정을 고를 수 있게 한다.
// selectAccount: false면 계정 선택을 강제하지 않는다. 브라우저에 Google 계정이 하나만 로그인되어 있으면 고르지 않고 바로 들어간다
// (연결 실패 뒤 방금 고른 기존 계정으로 바로 로그인할 때).
// 이동하기 전에 실패하면(Google 제공자 꺼짐 등) 오류를 던진다.
export async function signInWithGoogle(next = "/", { selectAccount = true }: { selectAccount?: boolean } = {}) {
  const { error } = await createClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      ...(selectAccount && { queryParams: { prompt: "select_account" } }),
    },
  });
  if (error) throw error;
}

// 익명 계정에 Google 계정을 연결한다("Google로 기록 지키기"). 사용자 ID가 그대로라 기록이 이어진다.
// Google 화면을 거쳐 /auth/callback으로 돌아오고, 이미 가입된 Google 계정이면 next?auth_error=…로 돌아온다.
// 연결할 때도 계정 선택 화면을 띄운다(그래야 연결 실패 뒤 "다른 Google 계정으로 연결"에서 다른 계정을 고를 수 있다).
// 이동하기 전에 실패하면(Manual linking 꺼짐 등) 오류를 던진다.
export async function linkGoogle(next = "/") {
  const { error } = await createClient().auth.linkIdentity({
    provider: "google",
    options: {
      redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw error;
}

// 지금 보고 있는 주소(로그인·연결 뒤 돌아올 곳)
export function currentPath() {
  return location.pathname + location.search;
}

// 로그아웃. 이 브라우저의 세션 쿠키만 지운다(다른 기기의 로그인은 그대로).
export async function signOut() {
  await createClient().auth.signOut({ scope: "local" });
}

// 로그아웃하고 시작 화면으로 간다. 화면에 남은 계정 데이터를 버리도록 페이지를 새로 연다.
export async function signOutToWelcome() {
  await signOut();
  location.assign(new URL("/welcome", location.origin));
}

// API가 세션이 없다고 하거나 계정 확인(verifyUserExists)에서 사용자가 없다고 하면 시작 화면으로 보낸다
// (쿠키가 없거나, 다른 기기에서 지웠거나 대시보드에서 지운 사용자의 쿠키가 남은 경우).
// 쿠키를 먼저 지운다. 지운 사용자의 토큰은 만료 전까지 proxy에서 '세션 있음'으로 보여서, 쿠키를 남긴 채
// /welcome으로 가면 /welcome → / → 401 → /welcome으로 계속 돈다. scope: "local"이라 서버에 묻지 않고 지운다.
export async function leaveToWelcome(): Promise<never> {
  await createClient()
    .auth.signOut({ scope: "local" })
    .catch(() => {});
  const next = currentPath();
  // 화면에 남은 데이터를 버리도록 페이지를 새로 연다(라우터 이동이 아니라 전체 이동)
  location.assign(new URL(`/welcome?next=${encodeURIComponent(next)}`, location.origin));
  // 페이지가 바뀌는 동안 화면이 오류 상태로 바뀌지 않게 끝나지 않는 약속을 돌려준다
  return new Promise<never>(() => {});
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (res.ok) return res.json();

  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  const code = body?.error.code ?? "INTERNAL";
  if (code === "UNAUTHENTICATED") return leaveToWelcome();
  throw new ApiError(code, body?.error.message ?? res.statusText, res.status);
}

const post = (path: string, date: string, extra?: Record<string, unknown>) =>
  request<TodayState>(path, { method: "POST", body: JSON.stringify({ date, ...extra }) });

export const api = {
  getToday: () => request<TodayState>("/api/today"),
  // date는 getToday가 돌려준 date를 그대로 보낸다. 서버 날짜와 다르면 DAY_CHANGED.
  draw: (date: string) => post("/api/today/draw", date),
  reroll: (date: string) => post("/api/today/reroll", date),
  // note: 완료 메모(비우면 메모 없이 완료)
  complete: (date: string, note?: string) => post("/api/today/complete", date, note ? { note } : undefined),
  getMonth: (month: string) => request<MonthRecords>(`/api/records?month=${month}`),
  // 완료한 날의 메모 쓰기·고치기. 비우면(null·빈 글) 지운다
  setNote: (date: string, note: string | null) =>
    request<NoteResult>("/api/records/note", { method: "PATCH", body: JSON.stringify({ date, note }) }),
  deleteAccount: () => request<DeleteAccountResult>("/api/account/delete", { method: "POST" }),
};

// 계정 삭제(설정의 "계정 삭제", 익명은 "이 기기 기록 모두 지우기"). 서버에서 사용자와 기록을 지운 뒤
// 쿠키를 지우고 페이지를 새로 열며 시작 화면으로 간다. 실패하면 오류를 던지고 아무것도 바뀌지 않는다.
// 이미 지워진 사용자(401)면 request가 쿠키를 지우고 시작 화면으로 보낸다.
// (나중에 Google 연결 해제를 붙이면 여기 앞에 Google 토큰 받기를 끼우고, 그 토큰을 삭제 요청에 보낸다)
export async function deleteAccountToWelcome() {
  await api.deleteAccount();
  await signOutToWelcome();
}
