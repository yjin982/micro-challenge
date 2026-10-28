"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { isNetworkError } from "@/lib/api";
import { NOTE_MAX_LENGTH, countNoteChars, stripLineBreaks } from "@/lib/note";
import { Button } from "./Button";
import { SketchDialog } from "./SketchDialog";

const TITLE = "오늘의 기적, 한 줄 남겨 볼까요?";

const modes = {
  // 홈에서 완료할 때(보드: 메모 대화상자)
  complete: {
    placeholder: "무엇이든 좋아요. 비워둬도 완료돼요.",
    submit: "완료하기",
    pending: "완료하는 중…",
    failed: "완료하지 못했어요.",
  },
  // 기록 화면에서 한 줄 남기기·수정할 때(보드: 기록 · 메모 수정). 이미 완료한 날이라 자리 글에 '완료'를 넣지 않는다
  edit: { placeholder: "무엇이든 좋아요.", submit: "저장", pending: "저장하는 중…", failed: "저장하지 못했어요." },
} as const;

// 완료 메모 대화상자(추가 기능 계획 1-2, 1-3, 1-6. 보드 5–8, 12, 15쪽). 마스코트·안내 문장 없이 제목, 입력창, 글자 수, 버튼.
// - 비워도 된다. 줄바꿈은 받지 않는다(Enter = 제출, 붙여 넣은 줄바꿈은 공백). 한글 조합 중의 Enter는 제출로 보지 않는다
// - 200자를 넘으면 입력창 테두리·글자 수가 빨간색, 주 버튼과 Enter 제출이 막힌다. 입력 자체는 막지 않는다
// - onSubmit(메모)이 실패하면(던지면) 대화상자를 닫지 않고 안내를 띄운다. 쓰던 글은 그대로 남는다
//   성공하면 부모가 이 컴포넌트를 내린다(완료면 도장 연출로, 수정이면 새 메모를 보여주며)
// - 취소·Esc로 닫으면 onClose. 보내는 동안에는 닫히지 않는다
export function NoteDialog({
  mode,
  initialNote = "",
  onSubmit,
  onClose,
}: {
  mode: keyof typeof modes;
  initialNote?: string | null;
  onSubmit: (note: string) => Promise<void>;
  onClose: () => void;
}) {
  const text = modes[mode];
  const [note, setNote] = useState(() => stripLineBreaks(initialNote ?? ""));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const countId = useId();
  const errorId = useId();

  const count = countNoteChars(note);
  const tooLong = count > NOTE_MAX_LENGTH;

  // 입력한 만큼 높이를 늘린다. 1줄에서 시작해 3줄(max-h-19.5 = 26px × 3)까지 늘고, 그 뒤로는 안에서 스크롤한다
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    // scrollHeight에는 테두리가 빠져 있어(box-sizing: border-box) 테두리 두께를 더해야 한 줄일 때 스크롤 막대가 생기지 않는다
    input.style.height = `${input.scrollHeight + input.offsetHeight - input.clientHeight}px`;
  }, [note]);

  // 수정할 때는 커서를 글 끝에 둔다(대화상자가 입력창에 포커스를 준 뒤에 실행된다)
  useEffect(() => {
    const input = inputRef.current;
    input?.setSelectionRange(input.value.length, input.value.length);
  }, []);

  async function submit() {
    if (pending || tooLong) return;
    setPending(true);
    setError(null);
    try {
      await onSubmit(note);
    } catch (reason) {
      setError(
        `${text.failed} ${isNetworkError(reason) ? "인터넷 연결을 확인하고 다시 눌러 주세요." : "잠시 후 다시 눌러 주세요."}`,
      );
      setPending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault(); // 줄바꿈은 받지 않는다
    // 한글 등 입력 조합 중에 누른 Enter는 글자를 확정하는 것이라 제출하지 않는다(Safari는 keyCode 229로 알린다)
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    void submit();
  }

  return (
    <SketchDialog title={TITLE} size="lg" dismissible={!pending} onClose={onClose}>
      <div className="flex w-full flex-col gap-1.5">
        {/* 테두리·둥근 모서리·여백은 바깥 상자가 맡는다. 입력창에 테두리를 두면 스크롤 막대가 둥근 외곽선을 덮어서다.
            여백을 눌러도 입력창에 포커스가 가게 한다 */}
        <div
          onClick={() => inputRef.current?.focus()}
          className={`rounded-sketch-sm border-2 bg-paper py-3 pr-2 pl-4 ${
            tooLong ? "border-sunday" : "border-ink-muted focus-within:border-primary"
          } ${pending ? "opacity-60" : ""}`}
        >
          <textarea
            ref={inputRef}
            data-autofocus
            rows={1}
            value={note}
            onChange={(e) => setNote(stripLineBreaks(e.target.value))}
            onKeyDown={handleKeyDown}
            placeholder={text.placeholder}
            aria-label={TITLE}
            aria-invalid={tooLong}
            aria-describedby={error ? `${countId} ${errorId}` : countId}
            enterKeyHint="done"
            readOnly={pending}
            aria-busy={pending}
            className="block max-h-19.5 w-full resize-none overflow-y-auto bg-transparent pr-2 text-base leading-relaxed outline-none scrollbar-soft placeholder:text-ink-faint"
          />
        </div>
        <p
          id={countId}
          aria-live="polite"
          className={`text-right text-[13px] ${tooLong ? "font-bold text-sunday" : "text-ink-muted"}`}
        >
          {count} / {NOTE_MAX_LENGTH}
          {tooLong && <span className="sr-only"> 글자 수를 넘었어요</span>}
        </p>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="w-full rounded-sketch-sm bg-badge-challenge px-4 py-3 text-[15px] leading-relaxed text-badge-challenge-ink"
        >
          {error}
        </p>
      )}

      <div className="mt-1 flex w-full flex-col gap-2.5">
        <Button onClick={submit} disabled={pending || tooLong} className="disabled:opacity-40">
          {pending ? text.pending : text.submit}
        </Button>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          취소
        </Button>
      </div>
    </SketchDialog>
  );
}
