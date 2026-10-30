import type { DoodleName } from "@/components/ui/Doodle";
import type { TapeColor } from "@/components/ui/Tape";
import type { StampId } from "@/types/api";

// 도장 그림과 어울리는 낙서 장식 하나(2026-10-30). 완료 카드(홈)와 기록 상세의 그림 칸에 도장 옆으로 곁들인다.
// 도장 그림을 그대로 반복하지 않고 짝이 되는 것을 고른다(토끼 도장 → 당근, 당근 도장 → 토끼).
export const STAMP_DOODLE: Record<StampId, DoodleName> = {
  p01: "cat-walk", // 고양이 · 참 잘했어요
  p02: "paw", // 강아지 · 내가 해냄
  p03: "star-orange", // 엄지 · VERY GOOD(왼쪽 반짝이와 겹치지 않게)
  p04: "carrot", // 토끼 · 럭키잖아
  p05: "shooting-star", // 별 · 최고야
  p06: "sun", // 오리 · 야르~
  p07: "cherry", // 체리 · 체고!
  p08: "bunny", // 당근 · 당근이지
  p09: "star", // 요술봉 · 작은 기적
  p10: "bee", // 꽃 · 꽃길만
  p11: "hearts", // 발바닥 · 꾹!
  p12: "bubbles", // 해파리 · 둥실둥실
};

// 도장 색과 같은 계열의 테이프 색. 완료 카드(홈)와 기록 상세의 위쪽 테이프에 쓴다
export const STAMP_TAPE: Record<StampId, TapeColor> = {
  p01: "red", // 빨강
  p02: "blue", // 파랑
  p03: "red", // 빨강
  p04: "green", // 초록
  p05: "red", // 분홍
  p06: "yellow", // 노랑
  p07: "purple", // 보라
  p08: "yellow", // 주황
  p09: "blue", // 하늘
  p10: "green", // 청록
  p11: "yellow", // 갈색(크라프트 테이프 느낌)
  p12: "purple", // 남색
};
