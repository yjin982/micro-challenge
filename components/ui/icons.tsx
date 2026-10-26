import type { ComponentProps } from "react";

// 설정·계정 메뉴에서 쓰는 가는 선 아이콘. 색은 currentColor를 따르고 크기는 className으로 정한다.
type IconProps = ComponentProps<"svg">;

const lineClass = "fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]";

function LineIcon({ className = "", children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`${lineClass} ${className}`} {...props}>
      {children}
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M15 5 L8 12 L15 19" />
    </LineIcon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M9 5 L16 12 L9 19" />
    </LineIcon>
  );
}

export function PersonIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5 C6 15.5 9 14 12 14 C15 14 18 15.5 19 19.5" />
    </LineIcon>
  );
}

// 사슬(계정 연결)
export function LinkIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M10 14 L14 10" />
      <path d="M11 6.5 L12.5 5 A3.5 3.5 0 0 1 19 10.5 L17.5 12" />
      <path d="M13 17.5 L11.5 19 A3.5 3.5 0 0 1 5 13.5 L6.5 12" />
    </LineIcon>
  );
}

// 톱니(설정)
export function GearIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3 V5.5 M12 18.5 V21 M3 12 H5.5 M18.5 12 H21 M5.6 5.6 L7.4 7.4 M16.6 16.6 L18.4 18.4 M5.6 18.4 L7.4 16.6 M16.6 7.4 L18.4 5.6" />
      <circle cx="12" cy="12" r="6.5" />
    </LineIcon>
  );
}

// 물음표 말풍선(피드백)
export function FeedbackIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M5 5 H19 V16 H11 L7 19.5 V16 H5 Z" />
      <path d="M10 9 A2 2 0 1 1 12.5 10.9 C12 11.1 12 11.5 12 12" />
      <path d="M12 14 V14.01" />
    </LineIcon>
  );
}

// 문 밖으로 나가는 화살표(로그아웃)
export function LogoutIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M10 5 H5 V19 H10" />
      <path d="M9 12 H20 M16 8 L20 12 L16 16" />
    </LineIcon>
  );
}

// 바깥 링크(새 탭으로 열림)
export function ExternalLinkIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M13 5 H19 V11 M19 5 L11 13" />
      <path d="M17 14 V19 H5 V7 H10" />
    </LineIcon>
  );
}
