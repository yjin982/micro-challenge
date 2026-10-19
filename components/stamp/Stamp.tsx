import type { ReactNode } from "react";
import type { StampId } from "@/types/api";

// 도장 6종(화면 설계 '도장 6종'·'도장 컴포넌트' 보드). public/images/stamps/의 SVG 원본을 JSX로 옮겼다.
// - 기본: 원형 테두리 두 줄 + 그림 + 문구. 원본은 지름 190px 기준이고 size에 맞춰 통째로 확대·축소한다.
// - mini: 달력·최근 기록용. 문구와 안쪽 점선 없이 원형 틀과 그림만, tilt로 기울인다.
// 색은 currentColor(도장마다 text-stamp-pXX), 문구 글꼴은 페이지의 Gaegu(font-hand),
// 거친 선은 CrayonFilters의 #stamp-rough 필터를 쓴다.

type StampText = { x: number; y: number; size: number; rotate: number; text: string };

type StampDesign = {
  name: string;
  color: string;
  // 기본 도장 전체를 기울이는 각도
  tilt: number;
  // 그림(200×200 좌표). 기본·mini에서 위치와 크기만 다르게 놓는다.
  art: ReactNode;
  artTransform: { full: string; mini: string };
  // 기본 도장에만 있는 장식(테두리 좌표 기준)
  extra?: ReactNode;
  // 문구 글자(190×190 좌표). 원본 SVG의 글자별 위치·회전 그대로
  texts: StampText[];
};

const STAMPS: Record<StampId, StampDesign> = {
  p01: {
    name: "참 잘했어요",
    color: "text-stamp-p01",
    tilt: -8,
    art: (
      <>
        <path d="M72 124 L76 102 L88 114 Q100 110 112 114 L124 102 L128 124 Q130 150 100 152 Q70 150 72 124 Z" />
        <circle cx="90" cy="128" r="3" fill="currentColor" stroke="none" />
        <circle cx="110" cy="128" r="3" fill="currentColor" stroke="none" />
        <path
          d="M95 137 q5 4 10 0 M70 132 l-7 -1.5 M70 138 l-7 1.5 M130 132 l7 -1.5 M130 138 l7 1.5"
          strokeWidth={3}
        />
      </>
    ),
    artTransform: {
      full: "translate(100 128) scale(1.38) translate(-100 -127)",
      mini: "translate(100 100) scale(1.35) translate(-100 -128)",
    },
    texts: [
      { x: 46.6, y: 75.3, size: 34.6, rotate: -63.5, text: "참" },
      { x: 72.9, y: 50.4, size: 34.6, rotate: -25.4, text: "잘" },
      { x: 102.8, y: 47.3, size: 34.6, rotate: 1.6, text: "했" },
      { x: 127.4, y: 55.6, size: 34.6, rotate: 28.5, text: "어" },
      { x: 146.6, y: 72.3, size: 34.6, rotate: 55.5, text: "요" },
    ],
  },
  p02: {
    name: "내가 해냄",
    color: "text-stamp-p02",
    tilt: 6,
    art: (
      <>
        <path d="M72 118 Q72 90 100 90 Q128 90 128 118 Q128 146 100 146 Q72 146 72 118 Z" />
        <path d="M80 97 Q66 92 62 106 Q58 122 65 133 Q71 139 74 128 Q74 112 79 103" />
        <path d="M120 97 Q134 92 138 106 Q142 122 135 133 Q129 139 126 128 Q126 112 121 103" />
        <path d="M84 112 Q89 110.5 94 112.5" strokeWidth={3} />
        <path d="M85.5 113 Q89 119.5 92.8 113.3 Z" fill="currentColor" strokeWidth={1.5} />
        <path d="M106 112.5 Q111 110.5 116 112" strokeWidth={3} />
        <path d="M107.2 113.3 Q111 119.5 114.5 113 Z" fill="currentColor" strokeWidth={1.5} />
        <path d="M107 104 Q112 99.5 118 102.5" strokeWidth={2.6} />
        <path d="M94.5 123.5 Q100 121 105.5 123.5 Q104 129 100 129 Q96 129 94.5 123.5 Z" fill="currentColor" strokeWidth={2} />
        <path d="M100 129 L100 133 M100 133 Q107 137.5 113 130.5 M100 133 Q96.5 134.5 93.5 133.5" strokeWidth={3} />
      </>
    ),
    artTransform: {
      full: "translate(100 116) scale(1.25) rotate(-6) translate(-100 -118)",
      mini: "translate(100 100) scale(1.3) translate(-100 -118)",
    },
    texts: [
      { x: 46.5, y: 66.2, size: 34, rotate: -57.5, text: "내" },
      { x: 70.1, y: 45.6, size: 34, rotate: -24.4, text: "가" },
      { x: 113.9, y: 44.8, size: 34, rotate: 22.4, text: "해" },
      { x: 138.3, y: 64.6, size: 34, rotate: 55.5, text: "냄" },
    ],
  },
  p03: {
    name: "VERY GOOD",
    color: "text-stamp-p03",
    tilt: -4,
    art: (
      <>
        <path d="M88 152 L88 124 L96 124 L105 102 Q113 100 113 110 L111 122 L126 122 Q132 124 130 132 L124 148 Q122 152 116 152 Z" />
        <path d="M78 124 L88 124 L88 152 L78 152 Z" />
      </>
    ),
    artTransform: {
      full: "translate(101 117) scale(1.5) translate(-105 -126)",
      mini: "translate(100 100) scale(1.45) translate(-105 -127)",
    },
    texts: [
      { x: 38, y: 87.3, size: 40, rotate: -80.2, text: "V" },
      { x: 45.1, y: 67.9, size: 40, rotate: -59.3, text: "E" },
      { x: 58.7, y: 52.4, size: 40, rotate: -38.4, text: "R" },
      { x: 77, y: 42.7, size: 40, rotate: -17.5, text: "Y" },
      { x: 109.4, y: 42.1, size: 40, rotate: 15.5, text: "G" },
      { x: 127.9, y: 51.2, size: 40, rotate: 36.4, text: "O" },
      { x: 142.1, y: 66.2, size: 40, rotate: 57.3, text: "O" },
      { x: 149.9, y: 85.4, size: 40, rotate: 78.2, text: "D" },
    ],
  },
  p04: {
    name: "럭키잖아",
    color: "text-stamp-p04",
    tilt: 9,
    art: (
      <>
        <path d="M89 114 Q82 88 90 86 Q97 88 96 114 M105 114 Q103 88 110 86 Q118 88 112 114" />
        <path d="M78 132 Q78 112 100 112 Q122 112 122 132 Q122 152 100 152 Q78 152 78 132 Z" />
        <circle cx="91" cy="129" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="109" cy="129" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="100" cy="141" r="3.2" strokeWidth={2.6} />
      </>
    ),
    artTransform: {
      full: "translate(100 79) scale(1.28) translate(-100 -119)",
      mini: "translate(100 100) scale(1.3) translate(-100 -119)",
    },
    texts: [{ x: 93.7, y: 137.1, size: 34, rotate: 0, text: "럭키잖아" }],
  },
  p05: {
    name: "최고야",
    color: "text-stamp-p05",
    tilt: -10,
    art: <path d="M100 98 L108 118 L130 120 L113 133 L118 154 L100 142 L82 154 L87 133 L70 120 L92 118 Z" />,
    artTransform: {
      full: "translate(100 80) scale(1.45) translate(-100 -126)",
      mini: "translate(100 102) scale(1.45) translate(-100 -126)",
    },
    texts: [{ x: 94.2, y: 139.7, size: 38, rotate: 0, text: "최고야" }],
  },
  p06: {
    name: "야르~",
    color: "text-stamp-p06",
    tilt: 4,
    art: (
      <>
        <path d="M78 136 Q78 120 94 120 Q92 106 104 104 Q116 103 116 116 L116 124 Q130 128 128 140 Q124 152 100 152 Q80 152 78 136 Z" />
        <circle cx="121" cy="119.5" r="4" strokeWidth={2.6} />
        <circle cx="108" cy="112" r="2.5" fill="currentColor" stroke="none" />
        <path d="M92 136 Q100 130 108 138" strokeWidth={3.5} />
      </>
    ),
    artTransform: {
      full: "translate(92 78) scale(1.5) translate(-104 -127.5)",
      mini: "translate(100 100) scale(1.45) translate(-104 -128)",
    },
    // 음표 두 개
    extra: (
      <>
        <ellipse cx="138" cy="60" rx="4.5" ry="3.5" fill="currentColor" stroke="none" />
        <path d="M142 59 L142 43 Q149 46 148 53" strokeWidth={3} />
        <ellipse cx="150" cy="86" rx="4" ry="3" fill="currentColor" stroke="none" />
        <path d="M153.5 85 L153.5 72" strokeWidth={3} />
      </>
    ),
    texts: [{ x: 96.4, y: 141.2, size: 44, rotate: 0, text: "야르~" }],
  },
};

// 선 그림 공통 속성: 테두리와 그림을 도장 색 선으로 그리고 거친 선 필터를 건다.
function Ink({ children }: { children: ReactNode }) {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: "url(#stamp-rough)" }}
    >
      {children}
    </g>
  );
}

export function Stamp({
  variant,
  size = 190,
  mini = false,
  tilt = 0,
  decorative = false,
  className = "",
}: {
  variant: StampId;
  // 지름(px). 화면 크기별로 바꿀 때는 className의 size-* 가 이 값을 덮어쓴다.
  size?: number;
  mini?: boolean;
  // mini 도장의 기울기(도). 기본 도장은 도장마다 정해진 각도로 기운다.
  tilt?: number;
  // 옆에 같은 정보가 글로 있으면 true로 스크린 리더에서 숨긴다.
  decorative?: boolean;
  className?: string;
}) {
  const stamp = STAMPS[variant];
  const a11y = decorative ? { "aria-hidden": true } : { role: "img", "aria-label": `${stamp.name} 도장` };

  if (mini) {
    return (
      <svg viewBox="0 0 200 200" width={size} height={size} className={`${stamp.color} ${className}`} {...a11y}>
        <g transform={tilt ? `rotate(${tilt} 100 100)` : undefined}>
          <Ink>
            <circle cx="100" cy="100" r="88" />
            <g transform={stamp.artTransform.mini}>{stamp.art}</g>
          </Ink>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 190 190" width={size} height={size} className={`${stamp.color} ${className}`} {...a11y}>
      {/* 그림은 200×200 좌표로 그려 190에 맞춰 줄인 뒤 도장째 기울인다 */}
      <g transform={`rotate(${stamp.tilt} 95 95) scale(0.95)`}>
        <Ink>
          <circle cx="100" cy="100" r="88" />
          <circle cx="100" cy="100" r="79" strokeWidth={2} strokeDasharray="3 7" />
          <g transform={stamp.artTransform.full}>{stamp.art}</g>
          {stamp.extra}
        </Ink>
      </g>
      <g fill="currentColor" textAnchor="middle" dominantBaseline="central" className="font-hand font-bold">
        {stamp.texts.map((t, i) => (
          <text key={i} x={t.x} y={t.y} fontSize={t.size} transform={t.rotate ? `rotate(${t.rotate} ${t.x} ${t.y})` : undefined}>
            {t.text}
          </text>
        ))}
      </g>
    </svg>
  );
}
