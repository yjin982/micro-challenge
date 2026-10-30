import { Doodle } from "./Doodle";

// 데스크톱 화면 여백에 두는 작은 낙서 장면(2026-10-30). 모바일은 화면이 좁아 넣지 않는다(hidden lg:block).
// - walk: 발자국을 따라 걸어가는 고양이(홈 오른쪽 열 아래)
// - nap: 달 아래에서 자는 고양이(기록 화면 달력 아래)
export function DoodleScene({ variant, className = "" }: { variant: "walk" | "nap"; className?: string }) {
  return (
    <div aria-hidden className={`relative hidden h-20 w-64 lg:block ${className}`}>
      {variant === "walk" ? (
        <>
          <Doodle name="paw" className="absolute bottom-1 left-0 size-5 -rotate-20 opacity-60" />
          <Doodle name="paw" className="absolute bottom-5 left-12 size-5 rotate-10 opacity-70" />
          <Doodle name="paw" className="absolute bottom-2 left-24 size-5 -rotate-10 opacity-80" />
          <Doodle name="paw" className="absolute bottom-6 left-36 size-5 rotate-15 opacity-90" />
          <Doodle name="cat-walk" className="absolute right-0 bottom-2 size-16" />
        </>
      ) : (
        <>
          <Doodle name="moon" className="absolute top-0 right-24 size-9 -rotate-12" />
          <Doodle name="star" className="absolute top-3 right-12 size-4 rotate-12" />
          <Doodle name="star" className="absolute top-9 right-36 size-3 -rotate-12" />
          <Doodle name="cat-sleep" className="absolute right-6 bottom-0 size-16" />
        </>
      )}
    </div>
  );
}
