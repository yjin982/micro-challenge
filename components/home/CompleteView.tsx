"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useEffectEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { TodayState } from "@/types/api";
import { DoneCard, STAMP_IMPACT } from "./DoneCard";

type Done = TodayState & { mission: NonNullable<TodayState["mission"]>; stampId: NonNullable<TodayState["stampId"]> };

// 완료 연출이 끝나고 모바일에서 연속 달성 화면으로 저절로 넘어가기까지의 시간
const AUTO_NEXT_MS = 3200;

// 완료한 날인지(미션과 도장이 모두 있는지) 확인한다. state가 done이면 서버가 둘 다 채워 준다.
export function isDone(today: TodayState): today is Done {
  return today.state === "done" && today.mission !== null && today.stampId !== null;
}

// 도장이 찍힌 뒤 아래에서 살짝 올라오며 나타나는 칭찬 문구
function Reveal({ show, className, children }: { show: boolean; className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={show ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: STAMP_IMPACT + 0.35, duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// 모바일 완료 화면(화면 설계 '홈 · 완료 연출'). 완료한 직후에만 보인다.
// 도장이 쾅 찍힌 뒤 잠시 있다가 연속 달성 화면으로 저절로 넘어가고, 버튼으로 바로 넘어갈 수도 있다.
export function CompleteView({ today, onNext }: { today: Done; onNext: () => void }) {
  const next = useEffectEvent(onNext);
  useEffect(() => {
    const timer = setTimeout(next, AUTO_NEXT_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mt-7">
      <DoneCard mission={today.mission} stampId={today.stampId} celebrate />
      <Reveal show className="mt-4.5">
        <div role="status" className="flex flex-col items-center gap-1.5">
          <Image src="/images/mascot/tyrano-did-it.png" alt="" width={167} height={198} loading="eager" className="h-auto w-37.5" />
          <p className="font-hand text-[34px] font-bold">오늘의 기적 완료!</p>
          <p className="text-sm text-ink-muted">도장이 쾅 찍혔어요. 오늘도 해냈다!</p>
        </div>
        <Button onClick={onNext} className="mt-5.5">
          연속 기록 보기
        </Button>
        <p className="mt-2 text-center text-xs text-ink-muted">도장 연출이 끝나면 자동으로 넘어가요</p>
      </Reveal>
    </div>
  );
}

// 데스크톱 완료 카드 아래 줄(화면 설계 '데스크톱 · 홈 완료'): 완료 포즈와 연속 일수.
// celebrate면(방금 완료) 도장이 찍힌 뒤에 나타난다.
export function DoneSummary({ streak, celebrate = false }: { streak: number; celebrate?: boolean }) {
  return (
    <Reveal show={celebrate} className="mt-3.5 pl-2">
      <div role="status" className="flex items-center gap-4">
        <Image src="/images/mascot/tyrano-did-it.png" alt="" width={167} height={198} loading="eager" className="h-auto w-32.5" />
        <div className="flex flex-col gap-1.5">
          <p className="font-hand text-[36px] leading-[1.05] font-bold">
            <span className="text-primary">{streak}일</span> 연속 달성!
          </p>
          <p className="text-sm leading-normal text-ink-muted">
            도장이 쾅 찍혔어요.
            <br />
            내일 또 만나요
          </p>
        </div>
      </div>
    </Reveal>
  );
}
