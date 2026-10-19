import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { TodayState } from "@/types/api";
import { DoneCard } from "./DoneCard";

type Done = TodayState & { mission: NonNullable<TodayState["mission"]>; stampId: NonNullable<TodayState["stampId"]> };

// 완료한 날인지(미션과 도장이 모두 있는지) 확인한다. state가 done이면 서버가 둘 다 채워 준다.
export function isDone(today: TodayState): today is Done {
  return today.state === "done" && today.mission !== null && today.stampId !== null;
}

// 모바일 완료 화면(화면 설계 '홈 · 완료 연출'). 완료한 직후에만 보이고, 버튼을 누르면 연속 달성 화면으로 넘어간다.
// 도장 연출과 자동으로 넘어가기는 다음 단계에서 붙인다.
export function CompleteView({ today, onNext }: { today: Done; onNext: () => void }) {
  return (
    <div className="mt-7">
      <DoneCard mission={today.mission} stampId={today.stampId} />
      <div role="status" className="mt-4.5 flex flex-col items-center gap-1.5">
        <Image src="/images/mascot/tyrano-did-it.png" alt="" width={167} height={198} loading="eager" className="h-auto w-37.5" />
        <p className="font-hand text-[34px] font-bold">오늘의 기적 완료!</p>
        <p className="text-sm text-ink-muted">도장이 쾅 찍혔어요. 오늘도 해냈다!</p>
      </div>
      <Button onClick={onNext} className="mt-5.5">
        연속 기록 보기
      </Button>
    </div>
  );
}

// 데스크톱 완료 카드 아래 줄(화면 설계 '데스크톱 · 홈 완료'): 완료 포즈와 연속 일수.
export function DoneSummary({ streak }: { streak: number }) {
  return (
    <div role="status" className="mt-3.5 flex items-center gap-4 pl-2">
      <Image src="/images/mascot/tyrano-did-it.png" alt="" width={167} height={198} loading="eager" className="h-auto w-32.5" />
      <div className="flex flex-col gap-1.5">
        <p className="font-hand text-[36px] leading-[1.05] font-bold">
          <span className="text-primary">{streak}일</span> 연속 달성!
        </p>
        <p className="text-sm leading-normal text-ink-muted">
          도장이 쾅 찍혔어요.
          <br />
          내일 또 만나요
        </p>
      </div>
    </div>
  );
}
