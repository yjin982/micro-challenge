import Image from "next/image";
import { StateCard } from "@/components/ui/StateCard";

const DOTS = [
  "bg-crayon-orange",
  "bg-crayon-yellow [animation-delay:150ms]",
  "bg-crayon-green [animation-delay:300ms]",
];

// 미션 꺼내는 중(화면 설계 '공통 상태 > 미션 꺼내는 중'): 뽑기·재뽑기 요청을 기다리는 동안 카드 자리에 보인다.
// 화면 설계의 '음료 마시기' 포즈 대신 물 주는 티라노를 쓴다.
export function MissionLoading() {
  return (
    <StateCard role="status">
      <Image src="/images/mascot/tyrano-watering.png" alt="" width={214} height={174} loading="eager" className="h-auto w-40" />
      <p className="font-hand text-[28px] font-bold">미션 꺼내는 중…</p>
      <div aria-hidden className="flex gap-2">
        {DOTS.map((dot) => (
          <span key={dot} className={`size-2.5 rounded-full motion-safe:animate-dot-bounce ${dot}`} />
        ))}
      </div>
    </StateCard>
  );
}
