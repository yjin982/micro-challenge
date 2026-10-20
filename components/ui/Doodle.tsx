import Image from "next/image";

type DoodleName = "flower" | "heart" | "note" | "swirl" | "sparkle" | "star" | "star-orange";

// 카드 구석에 곁들이는 크레파스 낙서 장식(public/images/decor). 위치·크기·기울기는 className으로 정한다.
// 꾸밈이라 스크린 리더와 터치에서 빠진다.
export function Doodle({ name, className }: { name: DoodleName; className: string }) {
  return (
    <Image
      src={`/images/decor/${name}.svg`}
      alt=""
      width={40}
      height={40}
      draggable={false}
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
