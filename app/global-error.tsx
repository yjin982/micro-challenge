"use client";

import { useEffect } from "react";
import { CrayonFilters } from "@/components/ui/CrayonFilters";
import { ErrorState } from "@/components/ui/ErrorState";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

// 루트 레이아웃에서 난 오류를 받는다. 레이아웃을 통째로 대신하므로 <html>·<body>, 전역 CSS, 폰트, 크레용 필터를 직접 둔다.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ko" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full items-center bg-paper-texture px-6 font-sans text-ink">
        <title>밍기적 챌린지</title>
        <CrayonFilters />
        <ErrorState onRetry={retry} />
      </body>
    </html>
  );
}
