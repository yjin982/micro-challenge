"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Stamp } from "@/components/stamp/Stamp";
import { PencilIcon } from "@/components/ui/icons";
import { SketchFrame } from "@/components/ui/sketch";
import type { Mission, StampId } from "@/types/api";
import { CardTape } from "./CardStack";
import { MissionBadges } from "./MissionBadges";

// 도장이 찍히는 순간(전체 연출 중 도장이 카드에 닿는 시점, 초)
export const STAMP_IMPACT = 0.36;

// 완료한 오늘의 카드(화면 설계 '홈 · 완료 연출'·'데스크톱 · 홈 완료'): 미션 문구 오른쪽 아래에 큰 도장이 찍힌다.
// 도장은 카드 안쪽에 두고, 문구 폭을 줄여 도장과 겹치지 않게 한다.
// celebrate면(방금 완료) 도장이 위에서 크게 내려와 쾅 찍히고(약 0.6초) 카드가 살짝 흔들린 뒤 반짝이가 나타난다.
// 동작 줄이기 설정이면 MotionConfig가 움직임을 빼고 페이드만 남긴다.
// note(완료 메모)가 있으면 카드 아래에 점선, 연필 아이콘과 메모를 덧붙이고 카드가 그만큼 길어진다(보드 메모 9, 16쪽).
export function DoneCard({
  mission,
  stampId,
  note = null,
  celebrate = false,
}: {
  mission: Mission;
  stampId: StampId;
  note?: string | null;
  celebrate?: boolean;
}) {
  return (
    <motion.article
      aria-label="완료한 오늘의 미션"
      className="relative mx-auto w-full max-w-85.5 bg-paper lg:max-w-100"
      animate={celebrate ? { x: [0, -5, 4, -2, 0] } : undefined}
      transition={{ delay: STAMP_IMPACT, duration: 0.3 }}
    >
      <SketchFrame />
      <CardTape />
      {/* 미션과 도장 자리(메모가 없을 때의 카드와 같은 크기). 도장과 반짝이는 이 자리를 기준으로 놓는다 */}
      <div className="relative flex h-62.5 flex-col gap-3.5 p-6.5 lg:h-65 lg:gap-4 lg:p-7.5">
        <MissionBadges difficulty={mission.difficulty} />
        <p className="w-40 font-hand text-[29px] leading-[1.22] font-bold lg:w-47.5 lg:text-[31px]">{mission.text}</p>
        <motion.div
          className="absolute right-3.5 bottom-3.5 lg:right-5 lg:bottom-4"
          initial={celebrate ? { opacity: 0, scale: 2.4, y: -90 } : false}
          animate={celebrate ? { opacity: [0, 1, 1, 1], scale: [2.4, 0.88, 1.06, 1], y: [-90, 0, 0, 0] } : undefined}
          transition={{ duration: 0.6, times: [0, 0.6, 0.8, 1], ease: "easeOut" }}
        >
          <Stamp variant={stampId} size={144} className="lg:size-40" />
        </motion.div>
        <Sparkle src="/images/decor/sparkle.svg" celebrate={celebrate} className="top-10 left-49 size-10 lg:top-8.5 lg:left-59" />
        <Sparkle src="/images/decor/star.svg" celebrate={celebrate} className="bottom-3.5 left-5 size-7 lg:bottom-3 lg:left-6" />
      </div>
      {note && (
        <p className="relative mx-6.5 flex gap-2 border-t-[1.5px] border-dashed border-line-faint pt-3 pb-5 text-[15px] leading-relaxed lg:mx-7.5 lg:pb-5.5">
          <PencilIcon className="mt-0.5 size-4.5 shrink-0 text-ink-muted" />
          {/* 띄어쓰기 없이 긴 글(영어·숫자)도 카드 밖으로 넘치지 않게, 넘칠 때만 줄을 끊는다 */}
          <span className="min-w-0 [overflow-wrap:anywhere]">
            <span className="sr-only">남긴 메모: </span>
            {note}
          </span>
        </p>
      )}
    </motion.article>
  );
}

// 도장이 찍힌 뒤 톡 튀어나오는 낙서 장식
function Sparkle({ src, celebrate, className }: { src: string; celebrate: boolean; className: string }) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={celebrate ? { opacity: 0, scale: 0.3 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: STAMP_IMPACT + 0.15, type: "spring", stiffness: 420, damping: 14 }}
    >
      <Image src={src} alt="" width={40} height={40} className="size-full" />
    </motion.div>
  );
}
