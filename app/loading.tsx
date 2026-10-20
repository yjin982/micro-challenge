import Image from "next/image";
import { Doodle } from "@/components/ui/Doodle";
import { StateCard, StateMain } from "@/components/ui/StateCard";

// 페이지를 불러오는 동안 내용 영역에 보이는 화면(화면 설계 '공통 상태 > 페이지 불러오는 중').
// 헤더와 하단 탭은 레이아웃이라 그대로 남는다.
export default function Loading() {
  return (
    <StateMain>
      <StateCard role="status">
        {/* 책 읽으며 흥얼거리는 음표 */}
        <Doodle name="note" className="absolute top-10 right-10 size-9 rotate-12" />
        <Doodle name="note" className="absolute bottom-12 left-10 size-7 -rotate-12" />
        <Image
          src="/images/mascot/tyrano-reading.png"
          alt=""
          width={161}
          height={164}
          loading="eager"
          className="h-auto w-40 motion-safe:animate-read-bob"
        />
        <p className="font-hand text-[28px] font-bold">페이지 넘기는 중…</p>
        <p className="text-[13px] text-ink-muted">조금만 기다려 주세요</p>
      </StateCard>
    </StateMain>
  );
}
