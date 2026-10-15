// 데이터가 들어올 자리(문구, 날짜, 이미지 등)를 표시하는 회색 블록.
// 크기와 모양은 className으로 정한다.
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block rounded-md bg-skeleton motion-safe:animate-pulse ${className}`} />;
}
