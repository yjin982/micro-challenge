"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDetailDate } from "@/lib/date";
import type { StampId } from "@/types/api";
import { DiaryFrame } from "@/components/ui/DiaryFrame";
import { DiaryPage } from "./DiaryPage";

// 선택한 날의 상태(화면 설계 '데스크톱 · 기록' 보드)
// - done: 미션을 완료한 날. 그림일기 한 쪽(DiaryPage: 날짜·완료 시각, 그림 칸의 미션 문구와 도장, 원고지 칸의 메모)
// - today: 오늘인데 아직 완료 전. 같은 그림일기 틀에 '여기에 쾅!'과 빈 원고지, 아래에 '오늘의 미션 하러 가기'
// - rest: 지난날인데 도장이 없는 날. 같은 틀에 '쉬어 간 날'과 빈 원고지(메모를 쓸 수 없어 버튼이 없다)
export type RecordDetailData =
  | { kind: "done"; date: string; completedAt: string; missionText: string; stampId: StampId; note: string | null }
  | { kind: "today"; date: string; missionText: string | null }
  | { kind: "rest"; date: string };

const descClass = "text-[13px] leading-normal text-ink-muted";
// 그림 칸의 도장 자리 점선 원(오늘·쉬어 간 날). 완료한 날의 도장(120px)과 같은 크기
const circleClass =
  "flex size-30 shrink-0 flex-col items-center justify-center gap-0.5 self-center rounded-full border-[2.5px] border-dashed text-center";
// 그림 칸의 글(오늘·쉬어 간 날)
const pictureTitleClass = "font-hand text-[25px] leading-[1.2] font-bold lg:text-[24px]";

// 모든 날을 같은 그림일기 틀(DiaryFrame)로 보여준다. detail이 null이면 불러오는 중 스켈레톤(같은 틀)
// onNoteChange: 완료한 날의 메모를 저장·삭제한 뒤 부르면 부모가 그 날짜의 메모를 바꿔 그린다(null이면 지운 것)
export function RecordDetail({
  detail,
  onNoteChange,
}: {
  detail: RecordDetailData | null;
  onNoteChange: (date: string, note: string | null) => void;
}) {
  if (!detail) {
    return (
      <DiaryFrame
        ariaLabel="선택한 날의 그림일기"
        live
        heading={<Skeleton className="h-3.5 w-40" />}
        picture={
          <>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
            <Skeleton className="size-30 shrink-0 self-center" rounded="rounded-full" />
          </>
        }
      />
    );
  }

  const date = formatDetailDate(detail.date);

  // 완료한 날은 그림일기 한 쪽(날짜 · 그림 칸 · 원고지). key를 날짜로 줘서 다른 날을 고르면 열린 대화상자가 닫힌다
  if (detail.kind === "done") {
    return <DiaryPage key={detail.date} detail={detail} onNoteChange={onNoteChange} />;
  }

  if (detail.kind === "today") {
    return (
      <DiaryFrame
        ariaLabel="선택한 날의 그림일기"
        live
        heading={
          <>
            {date} · <span className="font-bold text-primary">오늘</span>
          </>
        }
        picture={
          <>
            <div className="flex flex-col gap-1.5">
              <p className={pictureTitleClass}>오늘의 도장은 아직이에요</p>
              <p className={descClass}>
                {detail.missionText ? `오늘의 미션: ${detail.missionText}` : "아직 오늘의 미션을 뽑지 않았어요"}
              </p>
            </div>
            <div aria-hidden className={`${circleClass} -rotate-6 border-crayon-green`}>
              <span className="font-hand text-xl leading-none font-bold text-primary">여기에 쾅!</span>
              <span className="text-[11px] text-ink-muted">완료하면 찍혀요</span>
            </div>
          </>
        }
        footer={<ButtonLink href="/">오늘의 미션 하러 가기</ButtonLink>}
      />
    );
  }

  return (
    <DiaryFrame
      ariaLabel="선택한 날의 그림일기"
      live
      heading={date}
      picture={
        <>
          <div className="flex flex-col gap-1.5">
            <p className={pictureTitleClass}>이날은 도장이 없어요</p>
            <p className={descClass}>
              쉬어 간 날이에요.
              <br />
              도장은 미션을 완료한 날에만 찍혀요.
            </p>
          </div>
          <div aria-hidden className={`${circleClass} rotate-5 border-line-faint`}>
            <span className="font-hand text-xl leading-none font-bold text-line">쉬어 간 날</span>
          </div>
        </>
      }
    />
  );
}
