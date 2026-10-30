import Image from "next/image";

// 마스킹 테이프(public/images/decor/tape*.svg). 노랑(tape.svg)과 파랑·초록·보라·빨강(2026-10-30 추가) 다섯 색.
// 위치·폭·기울기는 className으로 정한다. 카드 위 가운데(CardTape)나 모서리에 비스듬히 붙인다.
export type TapeColor = "yellow" | "blue" | "green" | "purple" | "red";

export const TAPE_COLORS: TapeColor[] = ["yellow", "blue", "green", "purple", "red"];

// 같은 글자열이면 늘 같은 색(미션 ID, 날짜 등으로 카드마다 다른 색을 고를 때)
export function tapeColorFor(seed: string): TapeColor {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TAPE_COLORS[h % TAPE_COLORS.length];
}

export function Tape({ color = "yellow", className }: { color?: TapeColor; className: string }) {
  return (
    <Image
      src={color === "yellow" ? "/images/decor/tape.svg" : `/images/decor/tape-${color}.svg`}
      alt=""
      width={74}
      height={22}
      draggable={false}
      aria-hidden
      className={`pointer-events-none absolute h-auto select-none ${className}`}
    />
  );
}
