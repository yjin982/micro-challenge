"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "./icons";

// 모바일 제목 왼쪽의 뒤로 가기(설정, 처리방침·약관). 데스크톱에서는 숨긴다.
// 앱 안에서 넘어왔으면 이전 화면으로, 주소로 바로 들어왔으면(되돌아갈 기록이 없으면) fallbackHref로 간다.
export function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      aria-label="뒤로 가기"
      onClick={handleBack}
      className="-ml-3 flex size-11 shrink-0 items-center justify-center lg:hidden"
    >
      <ChevronLeftIcon className="size-6.5" />
    </button>
  );
}
