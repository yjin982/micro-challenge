import Image from "next/image";
import type { ReactNode } from "react";
import { SketchFrame } from "@/components/ui/sketch";

// 카드 자리 크기. 데스크톱은 오른쪽 열이 더 길면 늘어나 두 열의 아래 끝을 맞춘다.
export const CARD_SLOT = "relative mx-auto h-75 w-full max-w-85.5 lg:h-auto lg:min-h-82.5 lg:max-w-100 lg:flex-1";

// 맨 앞 카드 위치(뒤 카드보다 아래쪽 4px을 비워 겹쳐 보이게 한다)
export const FRONT_CARD = "absolute inset-x-0 top-0 bottom-1 bg-paper";

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
      className="absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-4"
    />
  );
}
