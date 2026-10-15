import Image from "next/image";
import { SketchFrame } from "@/components/ui/sketch";

// 페이지를 불러오는 동안 내용 영역에 보이는 화면(화면 설계 '공통 상태 > 페이지 불러오는 중').
// 헤더와 하단 탭은 레이아웃이라 그대로 남는다.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-120 px-6 pt-6.5 pb-28 lg:max-w-272 lg:pt-9 lg:pb-12">
      <div
        role="status"
        className="relative mx-auto flex min-h-115 w-full max-w-97.5 flex-col items-center justify-center gap-3 bg-paper p-6"
      >
        <SketchFrame shape="card-alt" />
        <Image
          src="/images/mascot/reading.png"
          alt=""
          width={196}
          height={192}
          loading="eager"
          className="h-auto w-42.5 motion-safe:animate-read-bob"
        />
        <p className="font-hand text-[28px] font-bold">페이지 넘기는 중…</p>
        <p className="text-[13px] text-ink-muted">조금만 기다려 주세요</p>
      </div>
    </main>
  );
}
