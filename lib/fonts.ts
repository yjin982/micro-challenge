import { Gaegu, Noto_Sans_KR } from "next/font/google";

// 루트 레이아웃과 global-error(레이아웃을 대신할 때)가 함께 쓰는 폰트. <html>에 변수 클래스로 붙인다.
const gaegu = Gaegu({
  variable: "--font-gaegu",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

export const fontVariables = `${gaegu.variable} ${notoSansKr.variable}`;
