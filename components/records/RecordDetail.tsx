"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Stamp } from "@/components/stamp/Stamp";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { NoteDialog } from "@/components/ui/NoteDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { SketchFrame } from "@/components/ui/sketch";
import { SketchDialog } from "@/components/ui/SketchDialog";
import { api, isNetworkError } from "@/lib/api";
import { formatCompletedTime, formatDetailDate } from "@/lib/date";
import type { StampId } from "@/types/api";

// 선택한 날의 상태(화면 설계 '데스크톱 · 기록' 보드)
// - done: 미션을 완료한 날(날짜·완료 시각, 미션 문구, 도장, 남긴 메모가 있으면 카드 아래에 메모)
// - today: 오늘인데 아직 완료 전
// - rest: 지난날인데 도장이 없는 날
export type RecordDetailData =
  | { kind: "done"; date: string; completedAt: string; missionText: string; stampId: StampId; note: string | null }
  | { kind: "today"; date: string; missionText: string | null }
  | { kind: "rest"; date: string };

const metaClass = "text-[13px] text-ink-muted";
const titleClass = "font-hand text-[25px] leading-[1.2] font-bold lg:text-[28px] lg:leading-[1.22]";
const descClass = "text-[13px] leading-normal text-ink-muted";
// 도장 자리의 점선 원(오늘·쉬어 간 날)
const circleClass =
  "flex size-24 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full border-[2.5px] border-dashed text-center lg:mt-1 lg:size-37.5";

// 모바일은 글 옆에 도장, 데스크톱은 글 아래에 큰 도장. detail이 null이면 불러오는 중 스켈레톤
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
      <Card>
        <div className="flex grow flex-col gap-2 lg:self-stretch">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <Skeleton className="size-24 shrink-0 lg:mt-1.5 lg:size-42.5" rounded="rounded-full" />
      </Card>
    );
  }

  const date = formatDetailDate(detail.date);

  if (detail.kind === "done") {
    return (
      <Card footer={<NoteFooter key={detail.date} date={detail.date} note={detail.note} onChange={onNoteChange} />}>
        <div className="flex grow flex-col gap-1.5 lg:self-stretch">
          <p className={metaClass}>
            {date} · {formatCompletedTime(detail.completedAt)} 완료
          </p>
          <p className={titleClass}>{detail.missionText}</p>
        </div>
        <Stamp variant={detail.stampId} className="size-24 shrink-0 lg:mt-1.5 lg:size-42.5" />
      </Card>
    );
  }

  if (detail.kind === "today") {
    return (
      <Card
        kind="today"
        footer={
          <ButtonLink href="/" className="mt-1">
            오늘의 미션 하러 가기
          </ButtonLink>
        }
      >
        <div className="flex grow flex-col gap-1.5 lg:self-stretch">
          <p className={metaClass}>
            {date} · <span className="font-bold text-primary">오늘</span>
          </p>
          <p className={titleClass}>오늘의 도장은 아직이에요</p>
          <p className={descClass}>
            {detail.missionText ? `오늘의 미션: ${detail.missionText}` : "아직 오늘의 미션을 뽑지 않았어요"}
          </p>
        </div>
        <div aria-hidden className={`${circleClass} -rotate-6 border-crayon-green`}>
          <span className="font-hand text-xl leading-none font-bold text-primary lg:text-[26px]">여기에 쾅!</span>
          {/* 모바일의 작은 원에는 들어가지 않아 데스크톱에서만 */}
          <span className="hidden text-[11px] text-ink-muted lg:block">완료하면 도장이 찍혀요</span>
        </div>
      </Card>
    );
  }

  return (
    <Card kind="rest">
      <div className="flex grow flex-col gap-1.5 lg:self-stretch">
        <p className={metaClass}>{date}</p>
        <p className={titleClass}>이날은 도장이 없어요</p>
        <p className={descClass}>
          쉬어 간 날이에요.
          <br />
          도장은 미션을 완료한 날에만 찍혀요.
        </p>
      </div>
      <div aria-hidden className={`${circleClass} rotate-5 border-line-faint`}>
        <span className="font-hand text-xl leading-none font-bold text-line lg:text-2xl">쉬어 간 날</span>
      </div>
    </Card>
  );
}

// 데스크톱 카드 아래 여백은 화면 설계 '데스크톱 · 기록' 보드대로 상태마다 조금씩 다르다(완료 20px, 오늘 22px, 쉬어 간 날 26px).
// 완료한 날 카드 아래(보드 메모 10–13, 17쪽). 점선 아래에
// - 메모가 있으면: 연필 아이콘과 메모, 오른쪽 아래 '수정'·'삭제'
// - 없으면: '한 줄 남기기'
// 수정·한 줄 남기기는 완료 때와 같은 메모 대화상자(저장), 삭제는 확인을 한 번 묻는다. 고칠 수 있는 것은 메모뿐이다.
// key를 날짜로 줘서 다른 날을 고르면 열려 있던 대화상자가 닫힌다.
function NoteFooter({
  date,
  note,
  onChange,
}: {
  date: string;
  note: string | null;
  onChange: (date: string, note: string | null) => void;
}) {
  const [dialog, setDialog] = useState<"edit" | "delete" | null>(null);
  const close = () => setDialog(null);

  async function save(next: string | null) {
    const result = await api.setNote(date, next);
    onChange(date, result.note);
    close();
  }

  return (
    <div className="flex flex-col gap-3 border-t-[1.5px] border-dashed border-line-faint pt-3">
      {note ? (
        <>
          <NoteLine note={note} />
          <div className="flex justify-end gap-2">
            <SmallButton onClick={() => setDialog("edit")}>
              <PencilIcon className="size-4" />
              수정
            </SmallButton>
            <SmallButton onClick={() => setDialog("delete")} className="text-sunday">
              <TrashIcon className="size-4" />
              삭제
            </SmallButton>
          </div>
        </>
      ) : (
        <Button variant="outline" onClick={() => setDialog("edit")} className="h-11 gap-2 text-xl">
          <PencilIcon className="size-5" />한 줄 남기기
        </Button>
      )}
      {dialog === "edit" && <NoteDialog mode="edit" initialNote={note} onSubmit={save} onClose={close} />}
      {dialog === "delete" && <DeleteNoteDialog onDelete={() => save(null)} onClose={close} />}
    </div>
  );
}

// 메모 지우기 확인(보드 메모 13쪽). 첫 포커스는 '취소'. 실패하면 대화상자 안에 안내한다
function DeleteNoteDialog({ onDelete, onClose }: { onDelete: () => Promise<void>; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setPending(true);
    setError(null);
    try {
      await onDelete();
    } catch (reason) {
      setError(
        isNetworkError(reason)
          ? "지우지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요."
          : "지우지 못했어요. 잠시 후 다시 눌러 주세요.",
      );
      setPending(false);
    }
  }

  return (
    <SketchDialog
      mascot={{ src: "/images/mascot/tyrano-thinking.png", width: 144, height: 175 }}
      title="이 메모를 지울까요?"
      description="미션 완료와 도장은 그대로예요."
      dismissible={!pending}
      onClose={onClose}
    >
      <div className="mt-1 flex w-full flex-col gap-2.5">
        <Button variant="danger" onClick={handleDelete} disabled={pending} className="disabled:opacity-60">
          {pending ? "지우는 중…" : "메모 지우기"}
        </Button>
        <Button variant="outline" onClick={onClose} disabled={pending} data-autofocus>
          취소
        </Button>
        {error && (
          <p role="alert" className="text-center text-[13px] text-sunday">
            {error}
          </p>
        )}
      </div>
    </SketchDialog>
  );
}

// 메모 옆의 작은 테두리 버튼(수정·삭제)
function SmallButton({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={`flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-line bg-paper px-3.5 text-sm ${className}`}
      {...props}
    />
  );
}

// 완료한 날의 메모: 연필 아이콘과 메모. 홈 완료 카드의 메모와 같은 모양
function NoteLine({ note }: { note: string }) {
  return (
    <p className="flex gap-2 text-[15px] leading-relaxed">
      <PencilIcon className="mt-0.5 size-4.5 shrink-0 text-ink-muted" />
      {/* 띄어쓰기 없이 긴 글(영어·숫자)도 카드 밖으로 넘치지 않게, 넘칠 때만 줄을 끊는다 */}
      <span className="min-w-0 [overflow-wrap:anywhere]">
        <span className="sr-only">남긴 메모: </span>
        {note}
      </span>
    </p>
  );
}

const cardBottom = { done: "lg:pb-5", today: "lg:pb-5.5", rest: "lg:pb-6.5" } as const;

function Card({
  kind = "done",
  children,
  footer,
}: {
  kind?: keyof typeof cardBottom;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section
      aria-label="선택한 날의 기록"
      aria-live="polite"
      className={`relative flex flex-col gap-3 bg-paper px-4.5 py-4 lg:px-6 lg:pt-6 ${cardBottom[kind]}`}
    >
      <SketchFrame shape="card-alt" />
      <div className="flex items-center gap-3.5 lg:flex-col lg:gap-2.5">{children}</div>
      {footer}
    </section>
  );
}
