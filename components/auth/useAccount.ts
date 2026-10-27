"use client";

import { isAuthApiError, type User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { leaveToWelcome } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

// 지금 세션의 계정 상태. null은 세션이 없거나 아직 확인하기 전이다.
// provider "email"은 이메일 계정이다(예전 개발용 /login으로 로그인한 테스트 계정 세션이 남아 있는 경우. /login은 2026-10-26에 지웠다).
export type Account =
  | { kind: "anonymous" }
  | {
      kind: "account";
      provider: "google" | "email";
      email: string | null;
      name: string | null;
      avatarUrl: string | null;
    };

function text(value: unknown) {
  return typeof value === "string" && value !== "" ? value : null;
}

// Google 이름·사진은 user_metadata에 들어온다. 익명 계정에 연결(linkIdentity)한 경우에는 비어 있을 수 있어
// 연결된 Google identity의 정보로 채운다.
function toAccount(user: User): Account {
  if (user.is_anonymous) return { kind: "anonymous" };
  const google = user.identities?.find((identity) => identity.provider === "google");
  const meta = user.user_metadata ?? {};
  const data = google?.identity_data ?? {};
  return {
    kind: "account",
    provider: google ? "google" : "email",
    email: text(user.email) ?? text(data.email),
    name: text(meta.full_name) ?? text(meta.name) ?? text(data.full_name) ?? text(data.name),
    avatarUrl: text(meta.avatar_url) ?? text(meta.picture) ?? text(data.avatar_url) ?? text(data.picture),
  };
}

// 세션 쿠키의 접속 토큰(JWT)은 서명만 확인하므로, 다른 기기에서 계정을 지웠거나 대시보드에서 사용자를 지워도
// 만료(최대 1시간)까지는 로그인된 것처럼 보인다. 그래서 계정을 보여줄 때 Supabase 인증 서버에 사용자가 있는지 묻는다(getUser).
// - 페이지를 열 때 한 번, 그리고 다른 탭·앱에 갔다가 돌아왔을 때(마지막 확인 뒤 1분이 지났으면) 다시 묻는다
//   useAccount를 쓰는 컴포넌트가 여럿이어도 요청은 한 번만 나간다
// - 서버가 "그런 사용자·세션이 없다"(user_not_found, session_not_found)고 답할 때만 쿠키를 지우고 시작 화면으로 간다.
//   인터넷이 끊기는 등 다른 실패는 그냥 넘긴다(로그아웃시키지 않는다)
const RECHECK_MS = 60_000;
const GONE_CODES = ["user_not_found", "session_not_found"];
let checking: Promise<void> | null = null;
let lastCheckedAt = 0;
let listening = false;

function verifyUserExists() {
  if (checking) return;
  lastCheckedAt = Date.now();
  checking = createClient()
    .auth.getUser()
    .then(({ error }) => {
      if (isAuthApiError(error) && error.code && GONE_CODES.includes(error.code)) void leaveToWelcome();
    })
    .catch(() => {})
    .finally(() => {
      checking = null;
    });
}

function recheckWhenVisible() {
  if (listening) return;
  listening = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Date.now() - lastCheckedAt > RECHECK_MS) verifyUserExists();
  });
}

// 로그인·로그아웃·연결 때마다 onAuthStateChange가 불려 바로 반영된다(구독 직후에도 현재 세션으로 한 번 불린다).
// 세션이 있으면 위의 사용자 확인을 함께 한다.
export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const { data } = createClient().auth.onAuthStateChange((_event, session) => {
      setAccount(session?.user ? toAccount(session.user) : null);
      if (session?.user) {
        if (lastCheckedAt === 0) verifyUserExists();
        recheckWhenVisible();
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return account;
}
