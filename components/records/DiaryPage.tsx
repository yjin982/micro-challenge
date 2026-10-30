"use client";

import { Stamp } from "@/components/stamp/Stamp";
import { STAMP_DOODLE, STAMP_TAPE } from "@/components/stamp/stampDoodle";
import { DiaryFrame } from "@/components/ui/DiaryFrame";
import { Doodle } from "@/components/ui/Doodle";
import { Tape } from "@/components/ui/Tape";
import { formatCompletedTime, formatDetailDate } from "@/lib/date";
import type { StampId } from "@/types/api";
import { NoteActions } from "./NoteActions";

// 기록 화면에서 완료한 날의 그림일기 한 쪽(추가 기능 계획 1-10).
// 날짜 줄 · 그림 칸(미션 문구, 그 아래 도장) · 원고지(메모) · 메모 버튼(NoteActions).
// 도장 없는 날(쉬어 간 날, 오늘 도장 전)은 RecordDetail이 같은 DiaryFrame으로 그린다.
// 날짜 줄 끝에 붙이는 '시작한 날'(완료한 날·오늘·시작한 날 카드가 함께 쓴다)
export function StartMark() {
  return <span className="font-bold text-primary"> · 시작한 날</span>;
}

export function DiaryPage({
  detail,
  onNoteChange,
}: {
  detail: { date: string; completedAt: string; missionText: string; stampId: StampId; note: string | null; start?: boolean };
  onNoteChange: (date: string, note: string | null) => void;
}) {
  return (
    <DiaryFrame
      heading={
        <>
          {formatDetailDate(detail.date)} · {formatCompletedTime(detail.completedAt)} 완료
          {detail.start && <StartMark />}
        </>
      }
      ariaLabel="선택한 날의 그림일기"
      live
      // 모서리에 도장 색 테이프(홈 완료 카드는 위 가운데). 모바일은 바로 위 달력의 오른쪽 아래 테이프와 겹치지 않게 왼쪽 위
      decoration={
        <Tape
          color={STAMP_TAPE[detail.stampId]}
          className="-top-2 -left-3 w-14 -rotate-30 lg:-right-4 lg:left-auto lg:w-16 lg:rotate-30"
        />
      }
      note={detail.note}
      picture={
        <>
          <p className="font-hand text-[25px] leading-[1.2] font-bold lg:text-[24px]">{detail.missionText}</p>
          <Stamp variant={detail.stampId} size={120} className="shrink-0 self-center" />
          {/* 낙서 장식은 도장 양옆에(위의 미션 문구와 겹치지 않게). 오른쪽은 도장과 짝인 낙서(STAMP_DOODLE) */}
          <Doodle name={STAMP_DOODLE[detail.stampId]} className="absolute right-6 bottom-12 size-9 rotate-6" />
          <Doodle name="sparkle" className="absolute bottom-20 left-8 size-6" />
        </>
      }
      footer={<NoteActions date={detail.date} note={detail.note} onChange={onNoteChange} />}
    />
  );
}
