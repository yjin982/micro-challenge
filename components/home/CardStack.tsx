import Image from "next/image";
import type { ReactNode } from "react";
import { SketchFrame } from "@/components/ui/sketch";

// 카드 폭(가운데 정렬). 카드 위 소제목도 이 폭을 써서 좌우 여백을 카드와 맞춘다
export const CARD_WIDTH = "mx-auto w-full max-w-85.5 lg:max-w-100";
// 카드 자리 크기. 데스크톱도 높이를 고정한다(오른쪽 열에 맞춰 늘리면 카드 안이 텅 비어 보인다).
export const CARD_SLOT = `relative h-75 lg:h-82.5 ${CARD_WIDTH}`;

// 맨 앞 카드 위치(뒤 카드보다 아래쪽 4px을 비워 겹쳐 보이게 한다). 카드 내용은 이 안을 꽉 채운다.
export const FRONT_CARD = "absolute inset-x-0 top-0 bottom-1";
export const CARD_FACE = "relative size-full bg-paper";

// 기울어진 카드 두 장을 깔고 그 위에 맨 앞 카드(children)를 올린다. 뽑기 전 카드 더미와 도전중 카드가 함께 쓴다.
export function CardStack({ children }: { children: ReactNode }) {
  return (
    <div className={CARD_SLOT}>
      <div className="absolute inset-x-2.5 inset-y-2 rotate-4 bg-paper">
        <SketchFrame tone="faint" />
      </div>
      <div className="absolute top-1.5 right-2.5 bottom-2 left-1.5 -rotate-3 bg-paper">
        <SketchFrame shape="card-alt" tone="faint" />
      </div>
      {children}
    </div>
  );
}

// 카드 위쪽 가운데에 붙은 노란 테이프
export function CardTape() {
  return (
    <Image
      src="/images/decor/tape.svg"
      alt=""
      width={74}
      height={22}
      draggable={false}
      className="absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-4"
    />
  );
}
