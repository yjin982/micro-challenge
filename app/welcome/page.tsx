import { Welcome } from "@/components/auth/Welcome";
import { safeNext } from "@/lib/safe-next";

// 시작 화면. 제목·설명·공유 이미지는 루트 레이아웃 것을 그대로 쓴다(링크 미리보기가 여기로 와도 홈과 같게 보인다). 세션이 없을 때 익명으로 시작할지 Google 계정으로 계속할지 고른다.
// ?next=돌아갈 경로, ?error=Google 로그인 실패·취소(/auth/callback이 붙인다).
// (로그인 개편 3단계의 proxy가 세션이 없는 방문자를 여기로 보낸다. 그 전에는 주소로 직접 들어와 확인한다)
export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const { next, error } = await searchParams;

  return (
    <Welcome
      next={safeNext(typeof next === "string" ? next : null)}
      authError={typeof error === "string" && error !== ""}
      devLogin={process.env.NODE_ENV === "development"}
    />
  );
}
