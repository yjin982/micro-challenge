import type { Metadata } from "next";
import { AnonymousSession } from "@/components/auth/AnonymousSession";
import { BottomTabs } from "@/components/nav/BottomTabs";
import { DesktopHeader } from "@/components/nav/DesktopHeader";
import { TodayLabel } from "@/components/nav/TodayLabel";
import { CrayonFilters } from "@/components/ui/CrayonFilters";
import { Skeleton } from "@/components/ui/Skeleton";
import { fontVariables } from "@/lib/fonts";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "밍기적 챌린지",
  description: "하루 1개, 아주 작은 미션을 뽑아 해내고 도장을 모으는 그림일기 챌린지",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-paper-texture font-sans text-ink">
        <AnonymousSession />
        <CrayonFilters />
        <DesktopHeader
          date={
            <Suspense fallback={<Skeleton className="h-4 w-28" />}>
              <TodayLabel />
            </Suspense>
          }
        />
        {children}
        <BottomTabs />
      </body>
    </html>
  );
}
