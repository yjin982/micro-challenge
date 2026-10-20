"use client";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTodayActions } from "./TodayProvider";

const rowClass = "mx-auto mt-3.5 w-full max-w-85.5 lg:max-w-100";
// 뽑기 전·불러오는 중에는 위에 남은 재뽑기 줄이 없어 카드와의 간격을 조금 더 둔다
const firstRowClass = "mx-auto mt-5 w-full max-w-85.5 lg:mt-6 lg:max-w-100";
const hintClass = "mt-2.5 text-center text-xs text-ink-muted";

// 카드 아래 버튼 영역. 오늘 상태에 따라 버튼을 고른다.
// - 한 번도 안 뽑음(not_drawn): '카드 뽑기'
// - 뽑음(challenge): '다시 뽑기'와 '완료했어요!'. 재뽑기 3번을 다 쓰면 '다시 뽑기' 대신 안내 문구
// - 완료(done): 완료·연속 달성 화면이 맡으므로 그리지 않는다
// 요청 중에는 버튼을 막고, 실패하면 버튼 아래에 안내를 보여준다.
export function DrawActions() {
  const { today, pending, actionError, run } = useTodayActions();

  // 오늘 상태를 불러오는 동안은 어떤 버튼일지 모르므로 버튼 자리만 잡아 둔다.
  if (!today) {
    return (
      <div className={firstRowClass}>
        <Skeleton className="h-13.5 rounded-sketch-btn" />
      </div>
    );
  }

  if (today.state === "done") return null;

  const busy = pending !== null;
  const error = actionError && (
    <p role="alert" className="mt-2.5 text-center text-[13px] text-sunday">
      {actionError}
    </p>
  );

  if (today.state === "not_drawn") {
    return (
      <>
        <div className={firstRowClass}>
          <Button onClick={() => run("draw")} disabled={busy} className="px-4 disabled:opacity-60">
            카드 뽑기
          </Button>
        </div>
        {error}
        <p className={`${hintClass} lg:hidden`}>스와이프 해서 새로운 미션 뽑기</p>
        <p className={`${hintClass} hidden lg:block`}>카드를 뽑은 뒤 마음에 안 들면 &apos;다시 뽑기&apos;로 바꿀 수 있어요</p>
      </>
    );
  }

  const canReroll = today.rerollsLeft > 0;

  return (
    <>
      {!canReroll && (
        <p role="status" className="mt-3.5 text-center font-hand text-[22px] font-bold">
          오늘 다시 뽑기를 모두 썼어요
        </p>
      )}
      <div className={`${rowClass} flex gap-2.5`}>
        {canReroll && (
          <Button variant="outline" onClick={() => run("reroll")} disabled={busy} className="flex-1 px-4">
            다시 뽑기
          </Button>
        )}
        <Button onClick={() => run("complete")} disabled={busy} className="flex-[1.4] px-4 disabled:opacity-60">
          {pending === "complete" ? "도장 찍는 중…" : "완료했어요!"}
        </Button>
      </div>
      {error}
      {canReroll && (
        <>
          <p className={`${hintClass} lg:hidden`}>스와이프 해서 새로운 미션 뽑기</p>
          <p className={`${hintClass} hidden lg:block`}>마음에 안 들면 &apos;다시 뽑기&apos;를 눌러 바꿀 수 있어요</p>
        </>
      )}
    </>
  );
}
