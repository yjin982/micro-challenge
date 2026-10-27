import { handleRpc } from "@/lib/api-server";

// 계정 삭제(Google·익명 모두). 지금 로그인한 사용자와 그 기록·세션을 지우고 { deleted: true }를 돌려준다.
// 쿠키 삭제와 시작 화면 이동은 브라우저가 한다(lib/api.ts의 deleteAccountToWelcome).
// Google 쪽 연결은 끊지 않는다(기본안). 나중에 끊게 되면 이 응답에 결과를 더한다(로그인 계획 4C단계 B안).
export async function POST() {
  return handleRpc("delete_my_account");
}
