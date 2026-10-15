// 크레파스 질감 SVG 필터. 루트 레이아웃에서 한 번만 렌더링하고
// filter-crayon / filter-crayon-sm 유틸리티로 참조한다.
export function CrayonFilters() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <filter id="crayon" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={3} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={3.5} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="crayon-sm" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves={1} seed={5} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={1.4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
