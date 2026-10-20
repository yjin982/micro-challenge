import Image from "next/image";
import { SketchFrame } from "@/components/ui/sketch";
import { CARD_FACE, CardStack, CardTape, FRONT_CARD } from "./CardStack";
import { SwipeCard } from "./SwipeCard";

// 뽑기 전 카드 더미: 기울어진 카드 두 장 위에 누를 수 있는 앞 카드. 누르거나(모바일은 좌우로 넘겨도) 오늘의 카드를 뽑는다.
export function CardPile({
  onDraw,
  swipeable = false,
  disabled = false,
}: {
  onDraw: () => boolean;
  swipeable?: boolean;
  disabled?: boolean;
}) {
  return (
    <CardStack>
      <SwipeCard enabled={swipeable && !disabled} onSwipe={onDraw} className={FRONT_CARD}>
        <button
          type="button"
          onClick={onDraw}
          disabled={disabled}
          aria-label="카드를 눌러 오늘의 미션 뽑기"
          className={`${CARD_FACE} flex flex-col items-center justify-center gap-2.5`}
        >
          <SketchFrame />
          <CardTape />
          {/* 버튼의 aria-label이 내용을 설명하므로 장식 이미지로 둔다 */}
          <Image
            src="/images/mascot/tyrano-thinking.png"
            alt=""
            width={144}
            height={175}
            loading="eager"
            draggable={false}
            className="h-auto w-32 lg:w-35"
          />
          <span className="font-hand text-[26px] font-bold lg:text-[28px]">눌러서 오늘의 미션 뽑기</span>
          <span className="text-[13px] text-ink-muted">어떤 미션이 나올까?</span>
        </button>
      </SwipeCard>
    </CardStack>
  );
}
