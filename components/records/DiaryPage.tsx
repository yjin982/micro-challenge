"use client";

import { Stamp } from "@/components/stamp/Stamp";
import { DiaryFrame } from "@/components/ui/DiaryFrame";
import { Doodle } from "@/components/ui/Doodle";
import { formatCompletedTime, formatDetailDate } from "@/lib/date";
import type { StampId } from "@/types/api";
import { NoteActions } from "./NoteActions";

// 기록 화면에서 완료한 날의 그림일기 한 쪽(추가 기능 계획 1-10).
// 날짜 줄 · 그림 칸(미션 문구, 그 아래 도장) · 원고지(메모) · 메모 버튼(NoteActions).
// 도장 없는 날(쉬어 간 날, 오늘 도장 전)은 RecordDetail이 같은 DiaryFrame으로 그린다.
export function DiaryPage({
  detail,
  onNoteChange,
}: {
  detail: { date: string; completedAt: string; missionText: string; stampId: StampId; note: string | null };
  onNoteChange: (date: string, note: string | null) => void;
}) {
  return (
    <DiaryFrame
      heading={`${formatDetailDate(detail.date)} · ${formatCompletedTime(detail.completedAt)} 완료`}
      ariaLabel="선택한 날의 그림일기"
      live
      note={detail.note}
      picture={
        <>
          <p className="font-hand text-[25px] leading-[1.2] font-bold lg:text-[24px]">{detail.missionText}</p>
          <Stamp variant={detail.stampId} size={120} className="shrink-0 self-center" />
          {/* 낙서 장식은 도장 양옆에(위의 미션 문구와 겹치지 않게) */}
          <Doodle name="heart" className="absolute right-8 bottom-14 size-6 rotate-12" />
          <Doodle name="sparkle" className="absolute bottom-20 left-8 size-6" />
        </>
      }
      footer={<NoteActions date={detail.date} note={detail.note} onChange={onNoteChange} />}
    />
  );
}
