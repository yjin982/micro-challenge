import { CalendarCard } from "@/components/home/CalendarCard";
import { CardPile } from "@/components/home/CardPile";
import { RecentRecords } from "@/components/home/RecentRecords";
import { RerollDots } from "@/components/home/RerollDots";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

// 홈 · 뽑기 전(state: not_drawn). 버튼은 아직 동작하지 않는다.
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[480px] px-6 pt-[26px] pb-28 lg:flex lg:max-w-[1088px] lg:gap-16 lg:pt-9 lg:pb-12">
      <section aria-labelledby="home-title" className="lg:w-[440px] lg:shrink-0">
        <header className="flex flex-col gap-1">
          <h1 id="home-title" className="font-hand text-[32px] leading-[1.1] font-bold lg:sr-only">
            밍기적 챌린지
          </h1>
          {/* 오늘 날짜(/api/today의 date). 데스크톱은 상단 헤더에 있다 */}
          <Skeleton className="h-4 w-28 lg:hidden" />
        </header>

        <p className="mt-2.5 font-hand text-[21px] lg:mt-0 lg:text-[22px]">
          오늘 일으킬 아주 작은 기적, 하나 뽑아볼까요?
        </p>

        <div className="mt-4 lg:mt-[18px]">
          <CardPile />
        </div>

        <RerollDots className="mt-[18px] lg:mt-5" />

        <div className="mx-auto mt-3.5 flex max-w-[342px] gap-2.5 lg:max-w-[400px]">
          <div className="hidden flex-1 lg:block">
            <Button variant="outline" disabled title="카드를 뽑은 뒤에 쓸 수 있어요">
              다시 뽑기
            </Button>
          </div>
          <div className="flex-[1.4]">
            <Button>카드 뽑기</Button>
          </div>
        </div>

        <p className="mt-2.5 text-center text-xs text-ink-muted lg:hidden">스와이프 해서 새로운 미션 뽑기</p>
        <p className="mt-2.5 hidden text-center text-xs text-ink-muted lg:block">
          카드를 뽑은 뒤 마음에 안 들면 &apos;다시 뽑기&apos;로 바꿀 수 있어요
        </p>
      </section>

      <div className="lg:min-w-0 lg:flex-1">
        <div className="hidden lg:block">
          <CalendarCard />
        </div>
        <RecentRecords />
      </div>
    </main>
  );
}
