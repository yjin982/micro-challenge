import Image from "next/image";

// 계정 프로필. Google 사진이 있으면 사진, 없으면 이름(없으면 이메일) 첫 글자를 연두 동그라미에 쓴다.
// Google 사진 주소는 바깥 서버라 최적화 없이 그대로 쓴다. 다른 사이트에 이 앱 주소가 넘어가지 않게 referrer를 보내지 않는다.
export function Avatar({
  name,
  email,
  url,
  className = "size-10 text-base",
}: {
  name: string | null;
  email: string | null;
  url: string | null;
  className?: string;
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={40}
        height={40}
        unoptimized
        referrerPolicy="no-referrer"
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  const initial = (name ?? email ?? "?").trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-chip-streak font-bold text-chip-streak-ink ${className}`}
    >
      {initial}
    </span>
  );
}
