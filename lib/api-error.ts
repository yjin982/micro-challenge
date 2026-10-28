import "server-only";
import { NextResponse } from "next/server";
import type { ApiErrorBody, ErrorCode } from "@/types/api";

// DB 함수가 던지는 코드(raise exception 'NO_REROLLS')를 HTTP 상태와 안내 문구로 바꾼다.
const ERRORS: Record<ErrorCode, { status: number; message: string }> = {
  UNAUTHENTICATED: { status: 401, message: "로그인이 필요해요." },
  INVALID_INPUT: { status: 400, message: "요청 값이 올바르지 않아요." },
  DAY_CHANGED: { status: 409, message: "날짜가 바뀌었어요. 오늘 상태를 다시 불러와 주세요." },
  ALREADY_DRAWN: { status: 409, message: "오늘 카드를 이미 뽑았어요." },
  NOT_DRAWN: { status: 409, message: "아직 오늘 카드를 뽑지 않았어요." },
  NO_REROLLS: { status: 409, message: "오늘 다시 뽑기를 모두 썼어요." },
  ALREADY_COMPLETED: { status: 409, message: "오늘 미션은 이미 완료했어요." },
  NOT_FOUND: { status: 404, message: "완료한 기록을 찾지 못했어요." },
  INTERNAL: { status: 500, message: "잠시 후 다시 시도해 주세요." },
};

// 세션 쿠키가 담길 수 있는 응답이라 CDN·브라우저에 캐시되지 않게 한다.
export const NO_STORE = { "Cache-Control": "private, no-store" };

// 알 수 없는 메시지(권한 오류, 네트워크 등)는 서버 로그에 남기고 INTERNAL로 돌려준다.
export function toErrorResponse(raw: string) {
  const code: ErrorCode = Object.hasOwn(ERRORS, raw) ? (raw as ErrorCode) : "INTERNAL";
  if (code !== raw) console.error("[api] 알 수 없는 오류:", raw);

  const { status, message } = ERRORS[code];
  return NextResponse.json<ApiErrorBody>({ error: { code, message } }, { status, headers: NO_STORE });
}
