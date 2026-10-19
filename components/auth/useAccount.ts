"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// 이메일 계정으로 로그인되어 있으면 그 이메일, 익명이거나 세션이 없으면 null.
// 로그인·로그아웃·익명 로그인 때마다 onAuthStateChange가 불려 바로 반영된다(구독 직후에도 현재 세션으로 한 번 불린다).
export function useAccount() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data } = createClient().auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setEmail(user && !user.is_anonymous ? (user.email ?? null) : null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return email;
}
