"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { useRef, type ReactNode } from "react";

// 카드 너비의 이 비율 이상 끌면 넘긴다(기획서: 30%). 못 미치면 제자리로 돌아온다.
const SWIPE_RATIO = 0.3;

// 좌우로 끌어 넘기는 맨 앞 카드(모바일 스와이프). 넘기면 끈 방향으로 기울며 날아간 뒤 onSwipe를 부른다.
// onSwipe가 false를 돌려주면(이미 다른 요청 중) 제자리로 돌아온다.
// enabled가 false면(데스크톱, 남은 재뽑기 0, 요청 중) 끌리지 않는 보통 카드다.
export function SwipeCard({
  enabled,
  onSwipe,
  enter = false,
  className = "",
  children,
}: {
  enabled: boolean;
  onSwipe?: () => boolean;
  // 새 카드가 뒤에서 앞으로 올라오듯 나타난다
  enter?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-300, 0, 300], [-14, 0, 14]);
  const reduceMotion = useReducedMotion();
  // 끌었다 놓은 손가락이 카드 안의 버튼을 누른 것으로 처리되지 않게 한다
  const dragged = useRef(false);

  async function handleDragEnd(_: unknown, info: PanInfo) {
    const width = ref.current?.offsetWidth ?? 0;
    const back = () => animate(x, 0, { type: "spring", stiffness: 500, damping: 32 });
    if (!onSwipe || Math.abs(info.offset.x) < width * SWIPE_RATIO) {
      back();
      return;
    }
    // 동작 줄이기: 날아가는 대신 그 자리에서 사라진다
    if (reduceMotion) await animate(opacity, 0, { duration: 0.2 });
    else await animate(x, Math.sign(info.offset.x) * width * 1.4, { duration: 0.28, ease: "easeIn" });
    if (!onSwipe()) {
      opacity.set(1);
      back();
    }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, rotate, opacity, touchAction: enabled ? "pan-y" : undefined }}
      drag={enabled ? "x" : false}
      onPointerDown={() => {
        dragged.current = false;
      }}
      onDragStart={() => {
        dragged.current = true;
      }}
      onDragEnd={handleDragEnd}
      onClickCapture={(e) => {
        if (!dragged.current) return;
        e.preventDefault();
        e.stopPropagation();
      }}
      initial={enter ? { scale: 0.92, y: 10 } : false}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      {children}
    </motion.div>
  );
}
