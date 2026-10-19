import type { ReactNode } from "react";
import { SketchFrame } from "./sketch";

// 공통 상태 화면(화면 설계 '공통 상태')의 손그림 카드 틀: 불러오는 중, 미션 꺼내는 중, 오류, 페이지 없음.
// 마스코트와 문구를 가운데에 세로로 쌓는다. size로 기본 크기(내용 영역 한가운데용) 대신 다른 자리에 맞출 수 있다.
export function StateCard({
  role,
  size = "min-h-115 max-w-97.5",
  children,
}: {
  role?: "status" | "alert";
  size?: string;
  children: ReactNode;
}) {
  return (
    <div role={role} className={`relative mx-auto flex w-full flex-col items-center justify-center gap-3 bg-paper p-6 ${size}`}>
      <SketchFrame shape="card-alt" />
      {children}
    </div>
  );
}
