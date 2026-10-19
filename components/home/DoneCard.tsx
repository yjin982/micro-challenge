import Image from "next/image";
import { Stamp } from "@/components/stamp/Stamp";
import { SketchFrame } from "@/components/ui/sketch";
import type { Mission, StampId } from "@/types/api";
import { CardTape } from "./CardStack";
import { MissionBadges } from "./MissionBadges";

// 완료한 오늘의 카드(화면 설계 '홈 · 완료 연출'·'데스크톱 · 홈 완료'): 미션 문구 오른쪽 아래에 큰 도장이 찍힌다.
// 도장은 카드 안쪽에 두고, 문구 폭을 줄여 도장과 겹치지 않게 한다.
// 도장 연출(위에서 내려와 쾅)은 아직 없고, 찍힌 뒤 모습만 그린다.
export function DoneCard({ mission, stampId }: { mission: Mission; stampId: StampId }) {
  return (
    <article
      aria-label="완료한 오늘의 미션"
      className="relative mx-auto flex h-62.5 w-full max-w-85.5 flex-col gap-3.5 bg-paper p-6.5 lg:h-65 lg:max-w-100 lg:gap-4 lg:p-7.5"
    >
      <SketchFrame />
      <CardTape />
      <MissionBadges difficulty={mission.difficulty} />
      <p className="w-40 font-hand text-[29px] leading-[1.22] font-bold lg:w-47.5 lg:text-[31px]">{mission.text}</p>
      <Stamp variant={stampId} size={144} className="absolute right-3.5 bottom-3.5 lg:right-5 lg:bottom-4 lg:size-40" />
      <Image
        src="/images/decor/sparkle.svg"
        alt=""
        width={40}
        height={40}
        className="absolute top-10 left-49 size-10 lg:top-8.5 lg:left-59"
      />
      <Image
        src="/images/decor/star.svg"
        alt=""
        width={40}
        height={40}
        className="absolute bottom-3.5 left-5 size-7 lg:bottom-3 lg:left-6"
      />
    </article>
  );
}
