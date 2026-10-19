"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

// 페이지를 그리다 난 오류(홈의 오늘 상태 불러오기 실패 포함)를 받는다. 헤더와 하단 탭은 레이아웃이라 그대로 남는다.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-120 px-6 pt-6.5 pb-28 lg:max-w-272 lg:pt-9 lg:pb-12">
      <ErrorState onRetry={retry} />
    </main>
  );
}
