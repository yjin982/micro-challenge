import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "로그인 · 밍기적 챌린지",
};

// 이메일 계정 로그인(회원가입 없음). 기본은 익명 로그인이라 메뉴에는 두지 않고 주소로 들어온다.
export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-120 px-6 pt-6.5 pb-28 lg:max-w-272 lg:pt-9 lg:pb-12">
      <LoginForm />
    </main>
  );
}
