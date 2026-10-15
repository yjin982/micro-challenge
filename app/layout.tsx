import type { Metadata } from "next";
import { Gaegu, Noto_Sans_KR } from "next/font/google";
import { BottomTabs } from "@/components/nav/BottomTabs";
import { DesktopHeader } from "@/components/nav/DesktopHeader";
import { CrayonFilters } from "@/components/ui/CrayonFilters";
import { formatDayLabel } from "@/lib/date";
import { getToday } from "@/lib/today";
import "./globals.css";

const gaegu = Gaegu({
  variable: "--font-gaegu",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "밍기적 챌린지",
  description: "하루 1개, 아주 작은 미션을 뽑아 해내고 도장을 모으는 그림일기 챌린지",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const today = await getToday();

  return (
    <html lang="ko" className={`${gaegu.variable} ${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper-texture font-sans text-ink">
        <CrayonFilters />
        <DesktopHeader dateLabel={formatDayLabel(today)} />
        {children}
        <BottomTabs />
      </body>
    </html>
  );
}
