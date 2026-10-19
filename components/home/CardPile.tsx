import Image from "next/image";
import { SketchFrame } from "@/components/ui/sketch";
import { CardStack, CardTape, FRONT_CARD } from "./CardStack";

// 뽑기 전 카드 더미: 기울어진 카드 두 장 위에 누를 수 있는 앞 카드. 누르면 오늘의 카드를 뽑는다.
export function CardPile({ onDraw, disabled = false }: { onDraw: () => void; disabled?: boolean }) {
  return (
    <CardStack>
      <button
        type="button"
        onClick={onDraw}
        disabled={disabled}
        aria-label="카드를 눌러 오늘의 미션 뽑기"
        className={`${FRONT_CARD} flex flex-col items-center justify-center gap-2.5`}
      >
        <SketchFrame />
        <CardTape />
        {/* 버튼의 aria-label이 내용을 설명하므로 장식 이미지로 둔다 */}
        <Image
          src="/images/mascot/tyrano-basic.png"
          alt=""
          width={145}
          height={150}
          loading="eager"
          className="h-auto w-32 lg:w-35"
        />
        <span className="font-hand text-[26px] font-bold lg:text-[28px]">눌러서 오늘의 미션 뽑기</span>
        <span className="text-[13px] text-ink-muted">어떤 미션이 나올까?</span>
      </button>
    </CardStack>
  );
}
