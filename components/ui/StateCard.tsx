import type { ReactNode } from "react";
import { SketchFrame } from "./sketch";

// 공통 상태 화면(화면 설계 '공통 상태')의 손그림 카드 틀: 불러오는 중, 미션 꺼내는 중, 오류, 페이지 없음.
// 마스코트와 문구를 가운데에 세로로 쌓는다.
export function StateCard({ role, children }: { role?: "status" | "alert"; children: ReactNode }) {
  return (
    <div
      role={role}
      className="relative mx-auto flex min-h-115 w-full max-w-97.5 flex-col items-center justify-center gap-3 bg-paper p-6"
    >
      <SketchFrame shape="card-alt" />
      {children}
    </div>
  );
}
