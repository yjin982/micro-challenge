"use client";

import { useEffect, useRef, useState } from "react";

// 말풍선이 달력 밖으로 나가지 않도록 일요일 칸은 왼쪽, 토요일 칸은 오른쪽에 맞춘다.
const alignClass = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
} as const;

// 달력 칸의 국경일·공휴일 이름. 칸보다 길어 말줄임된 경우에만 마우스를 올리거나 누르면 전체 이름을 말풍선으로 보여준다.
// 글자색은 부모(날짜 숫자와 같은 색)를 따른다.
export function HolidayLabel({
  name,
  align = "center",
  className = "",
}: {
  name: string;
  align?: keyof typeof alignClass;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLButtonElement>(null);

  const isTruncated = () => {
    const el = textRef.current;
    return !!el && el.scrollWidth > el.clientWidth;
  };
  const show = () => {
    if (isTruncated()) setOpen(true);
  };

  // 열려 있을 때 바깥을 누르거나 Esc를 누르면 닫는다.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative w-full">
      <button
        ref={textRef}
        type="button"
        // 누르면 열고, 닫기는 바깥을 누르거나 Esc로 한다. 마우스로 올린 채 눌러도 닫히지 않게 토글하지 않는다.
        onClick={show}
        // 터치는 손을 떼는 순간 pointerleave가 와서 바로 닫히므로 hover는 마우스일 때만 쓴다.
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        className={`block w-full truncate px-0.5 text-center tracking-tight ${className}`}
      >
        {name}
      </button>
      {open && (
        // 버튼 글자에 전체 이름이 이미 있으므로 스크린 리더에는 숨긴다.
        <span
          aria-hidden
          className={`absolute bottom-full z-20 mb-1 rounded-sketch-sm border-2 border-ink-muted bg-paper px-2.5 py-1 text-xs leading-4 font-bold whitespace-nowrap ${alignClass[align]}`}
        >
          {name}
        </span>
      )}
    </span>
  );
}
