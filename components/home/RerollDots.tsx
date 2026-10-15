import { Skeleton } from "@/components/ui/Skeleton";

const MAX_REROLLS = 3;

// 남은 재뽑기 표시. 뽑기 전에는 항상 3개가 모두 채워져 있다.
export function RerollDots({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-[13px] text-ink-muted ${className}`}>
      <span>다시 뽑기</span>
      {Array.from({ length: MAX_REROLLS }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className="size-3 rounded-full border-[1.5px] border-ink-muted bg-crayon-orange"
        />
      ))}
      {/* "N번 남음"(/api/today의 rerollsLeft) */}
      <Skeleton className="h-3.5 w-12" />
    </div>
  );
}
