import { CalendarCard } from "@/components/home/CalendarCard";
import { CardPile } from "@/components/home/CardPile";
import { RecentRecords } from "@/components/home/RecentRecords";
import { RerollDots } from "@/components/home/RerollDots";
import { TodayProvider } from "@/components/home/TodayProvider";
import { Button } from "@/components/ui/Button";
import { formatDayLabel } from "@/lib/date";
import { getHolidays } from "@/lib/holidays";
import { getToday } from "@/lib/today";

// 홈 · 뽑기 전(state: not_drawn). 남은 재뽑기·칩·최근 기록은 TodayProvider가 불러온 오늘 상태로 채운다.
// 버튼은 아직 동작하지 않는다.
export default async function Home() {
  const today = await getToday();
  const holidays = await getHolidays(today);

  return (
    <TodayProvider>
      <main className="mx-auto w-full max-w-120 px-6 pt-6.5 pb-28 lg:flex lg:max-w-272 lg:gap-16 lg:pt-9 lg:pb-12">
        {/* 데스크톱: 오른쪽 열이 더 길면 카드 더미가 늘어나 두 열의 아래 끝을 맞춘다 */}
        <section
          aria-labelledby="home-title"
          className="lg:flex lg:w-110 lg:shrink-0 lg:flex-col"
        >
          <header className="flex flex-col gap-1">
            <h1
              id="home-title"
              className="font-hand text-[32px] leading-[1.1] font-bold lg:sr-only"
            >
              밍기적 챌린지
            </h1>
            {/* 데스크톱은 상단 헤더에 날짜가 있다 */}
            <p className="text-[13px] text-ink-muted lg:hidden">
              {formatDayLabel(today)}
            </p>
          </header>

          <p className="mt-2.5 font-hand text-[21px] lg:mt-0 lg:text-[22px]">
            오늘 일으킬 아주 작은 기적, 하나 뽑아볼까요?
          </p>

          <div className="mt-4 lg:mt-4.5 lg:flex lg:flex-1 lg:flex-col">
            <CardPile />
          </div>

          <RerollDots className="mt-4.5 lg:mt-5" />

          <div className="mx-auto mt-3.5 flex max-w-85.5 gap-2.5 lg:max-w-100">
            <div className="hidden flex-1 lg:block">
              <Button
                variant="outline"
                disabled
                title="카드를 뽑은 뒤에 쓸 수 있어요"
                className="px-4"
              >
                다시 뽑기
              </Button>
            </div>
            <div className="flex-1">
              <Button className="px-4">카드 뽑기</Button>
            </div>
          </div>

          <p className="mt-2.5 text-center text-xs text-ink-muted lg:hidden">
            스와이프 해서 새로운 미션 뽑기
          </p>
          <p className="mt-2.5 hidden text-center text-xs text-ink-muted lg:block">
            카드를 뽑은 뒤 마음에 안 들면 &apos;다시 뽑기&apos;로 바꿀 수 있어요
          </p>
        </section>

        <div className="lg:min-w-0 lg:flex-1">
          <div className="hidden lg:block">
            <CalendarCard today={today} holidays={holidays} />
          </div>
          <RecentRecords />
        </div>
      </main>
    </TodayProvider>
  );
}
