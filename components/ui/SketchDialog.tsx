"use client";

import Image from "next/image";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { SketchFrame } from "./sketch";

const sizes = {
  // 확인 대화상자(연결 실패 안내, 로그아웃 확인, 계정 삭제 확인, 메모 지우기)
  md: "max-w-87",
  // 입력창이 있는 대화상자(메모). 데스크톱에서 더 넓게
  lg: "max-w-87 lg:max-w-120",
} as const;

// 제목·버튼(과 선택으로 마스코트·안내)으로 된 손그림 대화상자.
// 나타나면 바로 모달로 열린다. Esc나 children의 닫기 버튼으로 닫히면 onClose가 불리고, 부모가 이 컴포넌트를 내린다.
// 모달은 열릴 때 첫 버튼에 포커스를 준다. 첫 버튼이 되돌릴 수 없는 동작이거나 입력창에 먼저 포커스를 줘야 하면
// 그 요소에 data-autofocus를 붙인다(React의 autoFocus는 속성을 남기지 않아 showModal이 포커스를 다시 옮긴다).
// dismissible이 false인 동안에는 Esc로 닫히지 않는다(요청을 보내는 중 등).
export function SketchDialog({
  mascot,
  title,
  description,
  size = "md",
  dismissible = true,
  onClose,
  children,
}: {
  mascot?: { src: string; width: number; height: number };
  title: string;
  description?: ReactNode;
  size?: keyof typeof sizes;
  dismissible?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(e) => {
        if (!dismissible) e.preventDefault();
      }}
      aria-labelledby={titleId}
      className={`m-auto w-[calc(100%-48px)] ${sizes[size]} overflow-visible bg-transparent p-0 backdrop:bg-ink/40`}
    >
      {/* 어두운 배경 위라 바탕도 테두리처럼 둥글려야 모서리가 비치지 않는다 */}
      <div className="relative flex flex-col items-center gap-3 rounded-sketch bg-paper px-6 pt-7 pb-5">
        <SketchFrame />
        {mascot && (
          <Image src={mascot.src} alt="" width={mascot.width} height={mascot.height} className="h-auto w-30" />
        )}
        {/* break-keep: 한글이 글자 단위로 끊기지 않게 단어 단위로 줄을 바꾼다("지울까 / 요?" 방지) */}
        <h2 id={titleId} className="text-center font-hand text-[28px] leading-tight font-bold break-keep">
          {title}
        </h2>
        {description && <p className="text-center text-[15px] leading-relaxed text-ink-muted">{description}</p>}
        {children}
      </div>
    </dialog>
  );
}
