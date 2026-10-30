// CSS 직선 대신 쓰는 손그림 테두리와 구분선.

const frameShapes = {
  card: "rounded-sketch border-[2.5px] filter-crayon",
  "card-alt": "rounded-sketch-alt border-[2.5px] filter-crayon",
  sm: "rounded-sketch-sm border-2 filter-crayon-sm",
} as const;

const frameTones = {
  ink: "border-ink-muted",
  faint: "border-line",
} as const;

// 부모(relative)를 꽉 채우는 테두리. 내용물 대신 테두리에만 필터를 건다.
export function SketchFrame({
  shape = "card",
  tone = "ink",
}: {
  shape?: keyof typeof frameShapes;
  tone?: keyof typeof frameTones;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${frameShapes[shape]} ${frameTones[tone]}`}
    />
  );
}

// faint: 카드 안의 선(그림일기 칸 나눔, 달력 요일 줄, 계정 메뉴 칸 나눔). 원고지 격자·점선 구분선과 같은 line-faint.
// 카드 바깥 테두리(SketchFrame)와 버튼 외곽선은 진한 ink-muted 그대로
const lineTones = {
  ink: "border-t-2 border-ink-muted",
  faint: "border-t-[1.5px] border-line-faint",
  primary: "border-t-3 border-primary",
} as const;

export function SketchLine({
  tone = "ink",
  className = "",
}: {
  tone?: keyof typeof lineTones;
  className?: string;
}) {
  return <span aria-hidden className={`block h-0 filter-crayon-sm ${lineTones[tone]} ${className}`} />;
}
