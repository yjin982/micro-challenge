import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { SketchFrame } from "@/components/ui/sketch";

// 도장이 한 번도 없을 때 날짜 상세 자리에 보이는 안내
export function RecordsEmpty() {
  return (
    <section
      aria-labelledby="records-empty-title"
      className="relative flex flex-col items-center gap-2.5 bg-paper px-6 pt-7 pb-6"
    >
      <SketchFrame shape="card-alt" />
      <Image src="/images/mascot/tyrano-challenge.png" alt="" width={173} height={180} className="h-auto w-32.5" />
      <h2 id="records-empty-title" className="text-center font-hand text-[28px] leading-[1.22] font-bold">
        첫 도장을 찍어보세요
      </h2>
      <p className="text-center text-[13px] leading-normal text-ink-muted">
        오늘의 미션을 완료하면
        <br />
        달력에 도장이 하나씩 쌓여요
      </p>
      <ButtonLink href="/" className="mt-1.5">
        오늘의 미션 하러 가기
      </ButtonLink>
    </section>
  );
}
