"use client";

import type { CSSProperties, ReactNode } from "react";
import { SketchFrame, SketchLine } from "./sketch";

// 그림일기 한 쪽의 틀(2026-10-28 결정, 추가 기능 계획 1-10). 기록 화면의 날짜 상세와 홈 완료 카드가 함께 쓴다.
// (머리 줄) · 그림 칸 · 원고지 칸(메모, 한 칸에 한 글자) · 아래 영역.
// - heading: 머리 줄 '날짜 : …'(기록 화면, 예: '10월 28일 (수) · 오후 3:40 완료'). 없으면 머리 줄을 그리지 않는다(홈 완료 카드)
// - picture: 그림 칸 내용. pictureLayout이 stack(기본, 기록 화면)이면 위에서 아래로(글, 그 아래 가운데에 도장),
//   side(홈 완료 카드)면 글이 위에서 아래로 놓이고 도장은 내용 쪽에서 오른쪽 아래에 얹는다(absolute).
//   도장이 들어갈 높이를 최소 높이로 잡아 둔다
// - note: 원고지에 쓸 글(없으면 빈 3줄), footer: 원고지 아래(없으면 비운다)
// - decoration: 틀 위에 얹는 꾸밈(홈 카드의 테이프 등)

const COLS = 12; // 원고지 한 줄의 칸 수
const MIN_ROWS = 3; // 메모가 없거나 짧아도 보여줄 줄 수
const CELL = `calc(100cqw / ${COLS})`; // 칸 한 변(원고지 너비 ÷ 칸 수, 컨테이너 쿼리 단위)

export function DiaryFrame({
  heading,
  picture,
  pictureLayout = "stack",
  note = null,
  footer,
  decoration,
  ariaLabel,
  live = false,
}: {
  heading?: ReactNode;
  picture: ReactNode;
  pictureLayout?: "stack" | "side";
  note?: string | null;
  footer?: ReactNode;
  decoration?: ReactNode;
  ariaLabel: string;
  live?: boolean;
}) {
  return (
    <section
      aria-label={ariaLabel}
      aria-live={live ? "polite" : undefined}
      className="relative flex flex-col bg-paper px-5 pt-5 pb-5 lg:px-5.5"
    >
      <SketchFrame shape="card-alt" />
      {decoration}

      {heading && (
        <>
          <p className="flex flex-wrap items-baseline gap-x-2 pb-2.5">
            <span className="shrink-0 text-[15px]">날짜 :</span>
            <span className="text-[13px] text-ink-muted">{heading}</span>
          </p>
          <SketchLine tone="faint" />
        </>
      )}
      {/* 머리 줄이 없으면 그림 칸이 틀 맨 위에서 시작하므로 위 여백을 줄인다 */}
      <div
        className={`relative flex flex-col pb-4 ${pictureLayout === "side" ? "min-h-44 gap-3.5 lg:min-h-48 lg:gap-4" : "gap-3"} ${heading ? "pt-4" : "pt-1"}`}
      >
        {picture}
      </div>
      <SketchLine tone="faint" />

      <div className="mt-3">
        <NoteCells note={note} />
      </div>
      {footer && <div className="mt-3">{footer}</div>}
    </section>
  );
}

// 원고지 칸의 격자 선(손그림 느낌으로 살짝 흔들리게). 부모 높이만큼 정사각형 칸을 반복한다.
// 색은 카드 안 선(SketchLine faint)과 같은 연한 회색 line-faint. 카드 바깥 테두리만 진하다
function GridLines() {
  const style: CSSProperties = {
    backgroundImage:
      "linear-gradient(to right, var(--color-line-faint) 1.5px, transparent 1.5px), linear-gradient(to bottom, var(--color-line-faint) 1.5px, transparent 1.5px)",
    backgroundSize: `${CELL} ${CELL}`,
  };
  return (
    <span
      aria-hidden
      style={style}
      className="pointer-events-none absolute inset-0 border-r-[1.5px] border-b-[1.5px] border-line-faint filter-crayon-sm"
    />
  );
}

// 원고지: 한 칸에 한 글자. 글자는 화면에 보이는 글자 단위(이모지 포함)로 나누고, 띄어쓰기도 한 칸을 쓴다.
// 줄 수는 글 길이에 맞춰 늘어난다(최소 3줄). 칸마다 글자를 따로 그리면 화면 낭독기가 한 글자씩 읽으므로,
// 칸은 숨기고 전체 문장을 따로 읽게 한다
function NoteCells({ note }: { note: string | null }) {
  const chars = note ? splitGraphemes(note) : [];
  const rows = Math.max(MIN_ROWS, Math.ceil(chars.length / COLS));
  const cells = Array.from({ length: rows * COLS }, (_, i) => chars[i] ?? "");

  return (
    <div className="@container">
      <div className="relative">
        <GridLines />
        <div aria-hidden className="relative grid grid-cols-12">
          {cells.map((char, i) => (
            <span
              key={i}
              className="flex aspect-square items-center justify-center font-hand leading-none"
              style={{ fontSize: `calc(${CELL} * 0.72)` }}
            >
              {char}
            </span>
          ))}
        </div>
        {note && <span className="sr-only">남긴 메모: {note}</span>}
      </div>
    </div>
  );
}

function splitGraphemes(text: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return [...new Intl.Segmenter("ko", { granularity: "grapheme" }).segment(text)].map((s) => s.segment);
  }
  return [...text];
}
