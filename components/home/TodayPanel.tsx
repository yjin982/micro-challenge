"use client";

import type { ReactNode } from "react";
import type { Holidays } from "@/lib/holidays";
import { CardPile } from "./CardPile";
import { CARD_SLOT } from "./CardStack";
import { CompleteView, DoneSummary, isDone } from "./CompleteView";
import { DoneCard } from "./DoneCard";
import { DrawActions } from "./DrawActions";
import { MissionCard } from "./MissionCard";
import { MissionLoading } from "./MissionLoading";
import { RerollDots } from "./RerollDots";
import { StreakView } from "./StreakView";
import { useTodayActions } from "./TodayProvider";
import { useIsDesktop } from "./useIsDesktop";

function Subtitle({ children }: { children: ReactNode }) {
  return <p className="mt-2.5 font-hand text-[21px] lg:mt-0 lg:text-[22px]">{children}</p>;
}

// 홈 왼쪽(모바일은 제목 아래 전부). 오늘 상태(state)에 따라 화면을 고른다.
// - not_drawn: 카드 더미와 '카드 뽑기'
// - challenge: 오늘의 미션 카드와 '다시 뽑기'·'완료했어요!'
// - done: 데스크톱은 완료 카드와 연속 일수, 모바일은 방금 완료했으면 완료 화면, 아니면 연속 달성 화면
// 뽑기·재뽑기 요청 중에는 카드 자리에 '미션 꺼내는 중'을 띄운다.
export function TodayPanel({ date, holidays }: { date: string; holidays: Holidays }) {
  const { today, pending, justCompleted, run, showStreak } = useTodayActions();
  const isDesktop = useIsDesktop();

  if (today && isDone(today)) {
    if (isDesktop) {
      return (
        <>
          <Subtitle>오늘의 작은 기적을 해냈어요!</Subtitle>
          <div className="mt-4.5">
            <DoneCard mission={today.mission} stampId={today.stampId} />
          </div>
          <DoneSummary streak={today.streak} />
        </>
      );
    }
    return justCompleted ? (
      <CompleteView today={today} onNext={showStreak} />
    ) : (
      <StreakView today={today} date={date} holidays={holidays} />
    );
  }

  const drawing = pending === "draw" || pending === "reroll";

  return (
    <>
      {today ? (
        <Subtitle>
          {today.state === "challenge" ? "오늘의 작은 기적은 이거예요!" : "오늘 일으킬 아주 작은 기적, 하나 뽑아볼까요?"}
        </Subtitle>
      ) : (
        <span aria-hidden className="mt-3.5 block h-6 w-64 rounded-md bg-skeleton motion-safe:animate-pulse lg:mt-0.5" />
      )}

      <div className="mt-4 lg:mt-4.5 lg:flex lg:flex-1 lg:flex-col">
        {!today ? (
          // 어떤 카드가 나올지 모르는 동안은 카드 자리만 잡아 둔다
          <div aria-hidden className={`${CARD_SLOT} rounded-sketch bg-skeleton motion-safe:animate-pulse`} />
        ) : drawing ? (
          <MissionLoading size={CARD_SLOT} />
        ) : today.state === "challenge" && today.mission ? (
          <MissionCard mission={today.mission} />
        ) : (
          <CardPile onDraw={() => run("draw")} disabled={pending !== null} />
        )}
      </div>

      <RerollDots className="mt-4.5 lg:mt-5" />
      <DrawActions />
    </>
  );
}
