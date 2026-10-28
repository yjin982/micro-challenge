"use client";

import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/Button";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { NoteDialog } from "@/components/ui/NoteDialog";
import { SketchDialog } from "@/components/ui/SketchDialog";
import { api, isNetworkError } from "@/lib/api";

// 메모 버튼과 대화상자: 메모가 있으면 '수정'·'삭제', 없으면 '한 줄 남기기'.
// 기록 화면의 그림일기(DiaryPage) 아래에 둔다. 수정·한 줄 남기기는 메모 대화상자(저장, 비우고 저장하면 삭제),
// 삭제는 확인을 한 번 묻는다. 고칠 수 있는 것은 메모뿐이다.
export function NoteActions({
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
    <>
      {note ? (
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
      ) : (
        <Button variant="outline" onClick={() => setDialog("edit")} className="h-11 gap-2 text-xl">
          <PencilIcon className="size-5" />한 줄 남기기
        </Button>
      )}
      {dialog === "edit" && <NoteDialog mode="edit" initialNote={note} onSubmit={save} onClose={close} />}
      {dialog === "delete" && <DeleteNoteDialog onDelete={() => save(null)} onClose={close} />}
    </>
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
