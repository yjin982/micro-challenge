"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// 지금 세션의 계정 상태. null은 세션이 없거나 아직 확인하기 전이다.
// provider "email"은 개발 환경의 테스트 계정이다.
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

// 로그인·로그아웃·연결 때마다 onAuthStateChange가 불려 바로 반영된다(구독 직후에도 현재 세션으로 한 번 불린다).
export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    const { data } = createClient().auth.onAuthStateChange((_event, session) => {
      setAccount(session?.user ? toAccount(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return account;
}
