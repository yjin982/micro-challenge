import type { ComponentProps } from "react";

const variants = {
  primary: "bg-primary text-white",
  outline:
    "border-2 border-ink-muted bg-paper text-ink disabled:border-line-faint disabled:text-line",
} as const;

export function Button({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  return (
    <button
      type={type}
      className={`flex h-[54px] w-full items-center justify-center rounded-sketch-btn font-hand text-2xl font-bold ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
