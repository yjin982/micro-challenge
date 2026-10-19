"use client";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToday } from "./TodayProvider";

const hintClass = "mt-2.5 text-center text-xs text-ink-muted";

// 카드 아래 뽑기 버튼 영역. 오늘 상태에 따라 버튼을 하나만 보여준다(버튼 동작은 아직 연결하지 않았다).
// - 한 번도 안 뽑음(not_drawn): '카드 뽑기'
// - 한 번 이상 뽑음(challenge), 재뽑기 남음: '다시 뽑기'
// - 재뽑기 3번을 다 씀: 버튼 없이 더 뽑을 수 없다는 안내
// - 완료(done): 연속 달성 화면이 맡으므로 그리지 않는다
export function DrawActions() {
  const today = useToday();

  // 오늘 상태를 불러오는 동안은 어떤 버튼일지 모르므로 버튼 자리만 잡아 둔다.
  if (!today) {
    return (
      <div className="mx-auto mt-3.5 w-full max-w-85.5 lg:max-w-100">
        <Skeleton className="h-13.5 rounded-sketch-btn" />
      </div>
    );
  }

  if (today.state === "done") return null;

  if (today.state === "not_drawn") {
    return (
      <>
        <div className="mx-auto mt-3.5 w-full max-w-85.5 lg:max-w-100">
          <Button className="px-4">카드 뽑기</Button>
        </div>
        <p className={`${hintClass} lg:hidden`}>스와이프 해서 새로운 미션 뽑기</p>
        <p className={`${hintClass} hidden lg:block`}>카드를 뽑은 뒤 마음에 안 들면 &apos;다시 뽑기&apos;로 바꿀 수 있어요</p>
      </>
    );
  }

  if (today.rerollsLeft === 0) {
    return (
      <p role="status" className="mx-auto mt-3.5 w-full max-w-85.5 text-center font-hand text-[22px] font-bold lg:max-w-100">
        오늘 다시 뽑기를 모두 썼어요
      </p>
    );
  }

  return (
    <>
      <div className="mx-auto mt-3.5 w-full max-w-85.5 lg:max-w-100">
        <Button variant="outline" className="px-4">
          다시 뽑기
        </Button>
      </div>
      <p className={`${hintClass} lg:hidden`}>스와이프 해서 새로운 미션 뽑기</p>
      <p className={`${hintClass} hidden lg:block`}>마음에 안 들면 &apos;다시 뽑기&apos;를 눌러 바꿀 수 있어요</p>
    </>
  );
}
