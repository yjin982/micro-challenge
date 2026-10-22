import type { ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path d="M4 11 L12 4 L20 11 M6 10 V20 H18 V10" />
    </svg>
  );
}

function RecordsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <rect x="4" y="6" width="16" height="14" rx="3" />
      <path d="M4 10 H20 M9 3 V7 M15 3 V7" />
    </svg>
  );
}

export const navIconClass =
  "fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round] filter-crayon-sm";

export const NAV_ITEMS = [
  { href: "/", label: "홈", Icon: HomeIcon },
  { href: "/records", label: "기록", Icon: RecordsIcon },
] as const;

// 시작 화면과 (개발용) 로그인 화면. 데스크톱 헤더는 앱 이름만 보이고, 하단 탭은 숨긴다.
export function isAuthScreen(pathname: string) {
  return pathname === "/welcome" || pathname === "/login";
}
