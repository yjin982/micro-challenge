// 데이터가 들어올 자리(문구, 날짜, 이미지 등)를 표시하는 회색 블록.
// 크기는 className으로, 모서리는 rounded로 정한다(className에 rounded-*를 넣으면 기본값과 부딪혀 어느 쪽이 이길지 알 수 없다).
export function Skeleton({ className = "", rounded = "rounded-md" }: { className?: string; rounded?: string }) {
  return <span aria-hidden className={`block bg-skeleton motion-safe:animate-pulse ${rounded} ${className}`} />;
}
