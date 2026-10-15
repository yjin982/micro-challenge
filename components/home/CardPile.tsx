import Image from "next/image";
import { SketchFrame } from "@/components/ui/sketch";

// 뽑기 전 카드 더미: 기울어진 카드 두 장 위에 누를 수 있는 앞 카드.
export function CardPile() {
  return (
    <div className="relative mx-auto h-75 w-full max-w-85.5 lg:h-auto lg:min-h-82.5 lg:max-w-100 lg:flex-1">
      <div className="absolute inset-x-2.5 inset-y-2 rotate-4 bg-paper">
        <SketchFrame tone="faint" />
      </div>
      <div className="absolute top-1.5 right-2.5 bottom-2 left-1.5 -rotate-3 bg-paper">
        <SketchFrame shape="card-alt" tone="faint" />
      </div>
      <button
        type="button"
        aria-label="카드를 눌러 오늘의 미션 뽑기"
        className="absolute inset-x-0 top-0 bottom-1 flex flex-col items-center justify-center gap-2.5 bg-paper"
      >
        <SketchFrame />
        <Image
          src="/images/decor/tape.svg"
          alt=""
          width={74}
          height={22}
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-4"
        />
        {/* 버튼의 aria-label이 내용을 설명하므로 장식 이미지로 둔다 */}
        <Image
          src="/images/mascot/basic.png"
          alt=""
          width={190}
          height={165}
          loading="eager"
          className="h-auto w-32 lg:w-35"
        />
        <span className="font-hand text-[26px] font-bold lg:text-[28px]">
          눌러서 오늘의 미션 뽑기
        </span>
        <span className="text-[13px] text-ink-muted">어떤 미션이 나올까?</span>
      </button>
    </div>
  );
}
