import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = {
  title: "로그인 · 밍기적 챌린지",
};

// 이메일 계정 로그인(개발용 테스트 계정, 회원가입 없음). 운영(배포)에서는 페이지가 없다(404).
// 메뉴에는 두지 않고 주소나 시작 화면의 개발용 링크로 들어온다. 로그인하면 ?next=로 돌아간다.
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { next } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-120 px-6 pt-6.5 pb-28 lg:max-w-272 lg:pt-9 lg:pb-12">
      <LoginForm next={safeNext(typeof next === "string" ? next : null)} />
    </main>
  );
}
