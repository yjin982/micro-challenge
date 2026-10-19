"use client";

import { useSyncExternalStore } from "react";

// Tailwind lg 구간(64rem 이상)인지. 모바일과 데스크톱이 서로 다른 화면을 그려야 할 때 쓴다(완료 뒤 화면 등).
const QUERY = "(min-width: 64rem)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
