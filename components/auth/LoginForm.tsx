"use client";

import { isAuthApiError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SketchFrame } from "@/components/ui/sketch";
import { signInWithEmail, signOut } from "@/lib/api";
import { useAccount } from "./useAccount";

const inputClass =
  "h-12 w-full rounded-sketch-sm border-2 border-ink-muted bg-paper px-4 text-[15px] outline-none focus-visible:border-primary";

// 이메일 계정 로그인. 회원가입은 없고, 계정은 Supabase에서 직접 만든다(supabase/test-users.sql).
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 이미 이메일 계정으로 로그인되어 있으면 그 이메일(익명이면 null)
  const signedInEmail = useAccount();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await signInWithEmail(email.trim(), password);
      router.replace("/");
    } catch (reason) {
      setError(
        isAuthApiError(reason) && reason.code === "invalid_credentials"
          ? "이메일 또는 비밀번호가 맞지 않아요."
          : "로그인하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
      setPending(false);
    }
  }

  // 로그아웃하면 useAccount가 null이 되어 다시 로그인 폼이 보인다(/login에서는 익명 계정을 만들지 않는다).
  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className="relative mx-auto flex w-full max-w-97.5 flex-col gap-4 bg-paper px-6 pt-7 pb-6">
      <SketchFrame shape="card-alt" />
      <div className="flex flex-col gap-1">
        <h1 className="font-hand text-[32px] leading-[1.1] font-bold">로그인</h1>
        <p className="text-[13px] text-ink-muted">로그인하지 않아도 이 기기에 익명으로 기록이 저장돼요.</p>
      </div>

      {signedInEmail ? (
        <div className="flex flex-col gap-3">
          <p className="text-[15px]">
            <strong>{signedInEmail}</strong> 계정으로 로그인되어 있어요.
          </p>
          <ButtonLink href="/">홈으로</ButtonLink>
          <Button variant="outline" onClick={handleSignOut}>
            로그아웃
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-[13px] font-bold">
            이메일
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-bold">
            비밀번호
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </label>
          {error && (
            <p role="alert" className="text-[13px] text-sunday">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending} className="mt-1 disabled:opacity-60">
            {pending ? "로그인 중…" : "로그인"}
          </Button>
        </form>
      )}
    </div>
  );
}
