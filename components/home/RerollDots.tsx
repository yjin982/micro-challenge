"use client";

import { useToday } from "./TodayProvider";

const MAX_REROLLS = 3;

// 남은 재뽑기 표시. 남은 만큼 주황 점을 채우고, 쓴 만큼 비운다.
// 카드를 한 번이라도 뽑은 뒤(도전중)에만 보인다. 뽑기 전·불러오는 중·완료 뒤에는 그리지 않는다.
export function RerollDots({ className = "" }: { className?: string }) {
  const today = useToday();
  if (today?.state !== "challenge") return null;

  const left = today.rerollsLeft;
  return (
    <div className={`flex items-center justify-center gap-2 text-[13px] text-ink-muted ${className}`}>
      <span>다시 뽑기</span>
      {Array.from({ length: MAX_REROLLS }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={`size-3 rounded-full border-[1.5px] border-ink-muted ${i < left ? "bg-crayon-orange" : "bg-paper"}`}
        />
      ))}
      <span>{left}번 남음</span>
    </div>
  );
}
