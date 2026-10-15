import { Skeleton } from "@/components/ui/Skeleton";
import { SketchFrame } from "@/components/ui/sketch";

// 선택한 날의 상세(날짜·완료 시각, 미션 문구, 도장).
// 모바일은 문구 옆에 도장, 데스크톱은 문구 아래에 큰 도장.
export function RecordDetail() {
  return (
    <section
      aria-label="선택한 날의 기록"
      className="relative flex items-center gap-3.5 bg-paper px-4.5 py-4 lg:flex-col lg:gap-2.5 lg:px-6 lg:pt-6 lg:pb-5"
    >
      <SketchFrame shape="card-alt" />
      <div className="flex grow flex-col gap-2 lg:self-stretch">
        {/* "9월 27일 (일) · 오후 3:12 완료" */}
        <Skeleton className="h-3.5 w-36" />
        {/* 미션 문구 */}
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </div>
      {/* 도장 */}
      <Skeleton className="size-24 shrink-0 rounded-full lg:mt-1.5 lg:size-42.5" />
    </section>
  );
}
