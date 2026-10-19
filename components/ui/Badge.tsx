import type { ReactNode } from "react";

const tones = {
  // '오늘의 미션'처럼 기본 정보
  today: "bg-chip-today text-ink",
  // 도전적 미션(difficulty: challenge) 표시
  challenge: "bg-badge-challenge text-badge-challenge-ink",
} as const;

// 카드 머리에 붙는 작은 배지(화면 설계 '홈 · 도전중'의 '오늘의 미션'·'도전')
export function Badge({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}
