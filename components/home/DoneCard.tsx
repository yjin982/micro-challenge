"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Stamp } from "@/components/stamp/Stamp";
import { DiaryFrame } from "@/components/ui/DiaryFrame";
import type { Mission, StampId } from "@/types/api";
import { CardTape } from "./CardStack";
import { MissionBadges } from "./MissionBadges";

// 도장이 찍히는 순간(전체 연출 중 도장이 카드에 닿는 시점, 초)
export const STAMP_IMPACT = 0.36;

// 완료한 오늘의 카드. 기록 화면과 같은 그림일기 한 쪽(DiaryFrame, 추가 기능 계획 1-10)에 테이프를 붙였다.
// - 머리 줄은 없다(기록 화면은 날짜 줄이 있다. 데스크톱 홈은 카드 위 소제목이 '오늘의 작은 기적을 해냈어요!')
// - 그림 칸: 그림일기로 바꾸기 전 홈 카드와 같은 배치. 왼쪽 위에 '오늘의 미션'(·'도전') 배지와 폭을 고정한 미션 문구,
//   오른쪽 아래에 도장(144px, 데스크톱 160px)을 얹는다(도전중 카드와 같은 구성. 기록 화면은 위에 글·아래에 도장인 세로 배치)
// - 원고지: 완료 메모(없으면 빈 3줄). 홈에는 수정·삭제 버튼이 없다(기록 화면에서 고친다)
// celebrate면(방금 완료) 도장이 위에서 크게 내려와 쾅 찍히고(약 0.6초) 카드가 살짝 흔들린 뒤 반짝이가 나타난다.
// 동작 줄이기 설정이면 MotionConfig가 움직임을 빼고 페이드만 남긴다.
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
    <motion.div
      className="mx-auto w-full max-w-85.5 lg:max-w-100"
      animate={celebrate ? { x: [0, -5, 4, -2, 0] } : undefined}
      transition={{ delay: STAMP_IMPACT, duration: 0.3 }}
    >
      <DiaryFrame
        ariaLabel="완료한 오늘의 미션"
        decoration={<CardTape />}
        note={note}
        pictureLayout="side"
        picture={
          <>
            {/* 그림일기로 바꾸기 전 홈 카드와 같은 배치: 미션 문구는 폭을 고정해 짧게 여러 줄로 꺾고,
                도장은 그림 칸 오른쪽 아래에 얹는다 */}
            <MissionBadges difficulty={mission.difficulty} />
            <p className="w-40 font-hand text-[29px] leading-[1.22] font-bold lg:w-47.5 lg:text-[31px]">
              {mission.text}
            </p>
            <motion.div
              className="absolute right-0 bottom-2"
              initial={celebrate ? { opacity: 0, scale: 2.4, y: -90 } : false}
              animate={
                celebrate
                  ? {
                      opacity: [0, 1, 1, 1],
                      scale: [2.4, 0.88, 1.06, 1],
                      y: [-90, 0, 0, 0],
                    }
                  : undefined
              }
              transition={{
                duration: 0.6,
                times: [0, 0.6, 0.8, 1],
                ease: "easeOut",
              }}
            >
              <Stamp variant={stampId} size={144} className="lg:size-40" />
            </motion.div>
            {/* 반짝이도 예전 자리: 도장 왼쪽 위에 노란 반짝이, 그림 칸 왼쪽 아래 구석에 파란 별 */}
            <Sparkle
              src="/images/decor/sparkle.svg"
              celebrate={celebrate}
              className="top-6 left-43 size-10 lg:top-4 lg:left-53"
            />
            <Sparkle
              src="/images/decor/star.svg"
              celebrate={celebrate}
              className="bottom-2 left-0 size-7"
            />
          </>
        }
      />
    </motion.div>
  );
}

// 도장이 찍힌 뒤 톡 튀어나오는 낙서 장식
function Sparkle({
  src,
  celebrate,
  className,
}: {
  src: string;
  celebrate: boolean;
  className: string;
}) {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={celebrate ? { opacity: 0, scale: 0.3 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: STAMP_IMPACT + 0.15,
        type: "spring",
        stiffness: 420,
        damping: 14,
      }}
    >
      <Image src={src} alt="" width={40} height={40} className="size-full" />
    </motion.div>
  );
}
