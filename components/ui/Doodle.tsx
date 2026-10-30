import Image from "next/image";

export type DoodleName =
  | "flower"
  | "heart"
  | "note"
  | "swirl"
  | "sparkle"
  | "star"
  | "star-orange"
  // 2026-10-30 추가(도전중 카드의 분류별 장식 등)
  | "apple"
  | "bee"
  | "bubbles"
  | "bunny"
  | "carrot"
  | "cat-sleep"
  | "cat-walk"
  | "cherry"
  | "cloud"
  | "duck"
  | "flower-purple"
  | "hearts"
  | "jellyfish"
  | "moon"
  | "paw"
  | "ribbon"
  | "shooting-star"
  | "sprout"
  | "sun"
  | "tulip";

// 카드 구석에 곁들이는 크레파스 낙서 장식(public/images/decor). 위치·크기·기울기는 className으로 정한다.
// 꾸밈이라 스크린 리더와 터치에서 빠진다. eager면 화면에 들어오기 전에 미리 받는다(카드가 들어올 때 장식이 늦게 뜨지 않게)
export function Doodle({ name, className, eager = false }: { name: DoodleName; className: string; eager?: boolean }) {
  return (
    <Image
      src={`/images/decor/${name}.svg`}
      alt=""
      width={40}
      height={40}
      draggable={false}
      loading={eager ? "eager" : undefined}
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
