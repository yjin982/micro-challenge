import Link from "next/link";
import type { ComponentProps } from "react";

const base = "flex h-13.5 w-full items-center justify-center rounded-sketch-btn whitespace-nowrap";

const variants = {
  primary: "bg-primary text-white",
  // 되돌릴 수 없는 동작(계정 삭제 확인)
  danger: "bg-sunday text-white",
  outline:
    "border-2 border-ink-muted bg-paper text-ink disabled:border-line-faint disabled:text-line",
} as const;

// 글꼴: 기본은 손글씨(Gaegu). sans는 Google 버튼과 나란히 둘 때(시작 화면) 같은 본문 글꼴로 맞춘다.
const fonts = {
  hand: "font-hand text-2xl font-bold",
  sans: "font-sans text-base font-medium",
} as const;

type Variant = keyof typeof variants;
type Font = keyof typeof fonts;

export function Button({
  variant = "primary",
  font = "hand",
  type = "button",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; font?: Font }) {
  return <button type={type} className={`${base} ${fonts[font]} ${variants[variant]} ${className}`} {...props} />;
}

// 버튼 모양의 페이지 이동 링크
export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${fonts.hand} ${variants[variant]} ${className}`} {...props} />;
}
