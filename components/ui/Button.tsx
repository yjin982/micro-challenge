import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "flex h-13.5 w-full items-center justify-center rounded-sketch-btn whitespace-nowrap font-hand text-2xl font-bold";

const variants = {
  primary: "bg-primary text-white",
  outline:
    "border-2 border-ink-muted bg-paper text-ink disabled:border-line-faint disabled:text-line",
} as const;

type Variant = keyof typeof variants;

export function Button({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

// 버튼 모양의 페이지 이동 링크
export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
