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

// 상태 화면(불러오는 중, 오류, 페이지 없음)의 본문. 헤더(데스크톱 84px)와 하단 탭(모바일 74px)을 뺀 남은 영역의 한가운데에 카드를 둔다.
// 모바일 아래 여백은 하단 탭 높이 + 위 여백과 같은 24px이라, 탭 위로 보이는 영역의 가운데에 온다. 카드가 화면보다 크면 탭에 가리지 않게 스크롤된다.
export function StateMain({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col justify-center px-6 pt-6 pb-[calc(6.125rem+env(safe-area-inset-bottom))] lg:min-h-[calc(100dvh-5.25rem)] lg:max-w-272 lg:py-9">
      {children}
    </main>
  );
}
