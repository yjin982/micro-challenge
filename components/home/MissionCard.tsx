import Image from "next/image";
import { SketchFrame } from "@/components/ui/sketch";
import type { Mission } from "@/types/api";
import { CARD_FACE, CardStack, CardTape, FRONT_CARD } from "./CardStack";
import { MissionBadges } from "./MissionBadges";
import { SwipeCard } from "./SwipeCard";

// 도전중 카드(화면 설계 '홈 · 도전중'): 배지, 미션 문구, 도전 중 티라노. 미션 번호(E001 등)는 보여주지 않는다.
// 뒤에 기울어진 카드 두 장이 겹쳐 보여 다시 뽑을 카드가 남아 있는 느낌을 준다.
// onSwipe가 있으면(모바일, 재뽑기 남음) 좌우로 넘겨 다시 뽑는다.
export function MissionCard({ mission, onSwipe }: { mission: Mission; onSwipe?: () => boolean }) {
  return (
    <CardStack>
      <SwipeCard enabled={!!onSwipe} onSwipe={onSwipe} enter className={FRONT_CARD}>
        <article
          aria-label="오늘의 미션"
          className={`${CARD_FACE} flex flex-col gap-3.5 px-6.5 pt-6.5 pb-4.5 lg:gap-4 lg:px-7.5 lg:pt-7.5 lg:pb-5`}
        >
          <SketchFrame />
          <CardTape />
          <MissionBadges difficulty={mission.difficulty} />
          <p className="w-50 font-hand text-[29px] leading-[1.22] font-bold lg:w-57.5 lg:text-[32px]">{mission.text}</p>
          <Image
            src="/images/mascot/tyrano-challenge.png"
            alt=""
            width={173}
            height={180}
            loading="eager"
            draggable={false}
            className="absolute right-4 bottom-3.5 h-auto w-26 lg:right-5 lg:bottom-4 lg:w-30"
          />
        </article>
      </SwipeCard>
    </CardStack>
  );
}
