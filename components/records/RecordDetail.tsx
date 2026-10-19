import type { ReactNode } from "react";
import { Stamp } from "@/components/stamp/Stamp";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SketchFrame } from "@/components/ui/sketch";
import { formatCompletedTime, formatDetailDate } from "@/lib/date";
import type { StampId } from "@/types/api";

// 선택한 날의 상태(화면 설계 '데스크톱 · 기록' 보드)
// - done: 미션을 완료한 날(날짜·완료 시각, 미션 문구, 도장)
// - today: 오늘인데 아직 완료 전
// - rest: 지난날인데 도장이 없는 날
export type RecordDetailData =
  | { kind: "done"; date: string; completedAt: string; missionText: string; stampId: StampId }
  | { kind: "today"; date: string; missionText: string | null }
  | { kind: "rest"; date: string };

const metaClass = "text-[13px] text-ink-muted";
const titleClass = "font-hand text-[25px] leading-[1.2] font-bold lg:text-[28px] lg:leading-[1.22]";
const descClass = "text-[13px] leading-normal text-ink-muted";
// 도장 자리의 점선 원(오늘·쉬어 간 날)
const circleClass =
  "flex size-24 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full border-[2.5px] border-dashed text-center lg:mt-1 lg:size-37.5";

// 모바일은 글 옆에 도장, 데스크톱은 글 아래에 큰 도장. detail이 null이면 불러오는 중 스켈레톤
export function RecordDetail({ detail }: { detail: RecordDetailData | null }) {
  if (!detail) {
    return (
      <Card>
        <div className="flex grow flex-col gap-2 lg:self-stretch">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <Skeleton className="size-24 shrink-0 rounded-full lg:mt-1.5 lg:size-42.5" />
      </Card>
    );
  }

  const date = formatDetailDate(detail.date);

  if (detail.kind === "done") {
    return (
      <Card>
        <div className="flex grow flex-col gap-1.5 lg:self-stretch">
          <p className={metaClass}>
            {date} · {formatCompletedTime(detail.completedAt)} 완료
          </p>
          <p className={titleClass}>{detail.missionText}</p>
        </div>
        <Stamp variant={detail.stampId} className="size-24 shrink-0 lg:mt-1.5 lg:size-42.5" />
      </Card>
    );
  }

  if (detail.kind === "today") {
    return (
      <Card
        footer={
          <ButtonLink href="/" className="mt-1">
            오늘의 미션 하러 가기
          </ButtonLink>
        }
      >
        <div className="flex grow flex-col gap-1.5 lg:self-stretch">
          <p className={metaClass}>
            {date} · <span className="font-bold text-primary">오늘</span>
          </p>
          <p className={titleClass}>오늘의 도장은 아직이에요</p>
          <p className={descClass}>
            {detail.missionText ? `오늘의 미션: ${detail.missionText}` : "아직 오늘의 미션을 뽑지 않았어요"}
          </p>
        </div>
        <div aria-hidden className={`${circleClass} -rotate-6 border-crayon-green`}>
          <span className="font-hand text-xl leading-none font-bold text-primary lg:text-[26px]">여기에 쾅!</span>
          {/* 모바일의 작은 원에는 들어가지 않아 데스크톱에서만 */}
          <span className="hidden text-[11px] text-ink-muted lg:block">완료하면 도장이 찍혀요</span>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex grow flex-col gap-1.5 lg:self-stretch">
        <p className={metaClass}>{date}</p>
        <p className={titleClass}>이날은 도장이 없어요</p>
        <p className={descClass}>
          쉬어 간 날이에요.
          <br />
          도장은 미션을 완료한 날에만 찍혀요.
        </p>
      </div>
      <div aria-hidden className={`${circleClass} rotate-5 border-line-faint`}>
        <span className="font-hand text-xl leading-none font-bold text-line lg:text-2xl">쉬어 간 날</span>
      </div>
    </Card>
  );
}

function Card({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <section
      aria-label="선택한 날의 기록"
      aria-live="polite"
      className="relative flex flex-col gap-3 bg-paper px-4.5 py-4 lg:px-6 lg:pt-6 lg:pb-5"
    >
      <SketchFrame shape="card-alt" />
      <div className="flex items-center gap-3.5 lg:flex-col lg:gap-2.5">{children}</div>
      {footer}
    </section>
  );
}
