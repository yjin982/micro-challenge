import { MobileAccountMenu } from "@/components/auth/MobileAccountMenu";
import { CalendarCard } from "@/components/home/CalendarCard";
import { CardPile } from "@/components/home/CardPile";
import { DrawActions } from "@/components/home/DrawActions";
import { RecentRecords } from "@/components/home/RecentRecords";
import { RerollDots } from "@/components/home/RerollDots";
import { TodayProvider } from "@/components/home/TodayProvider";
import { formatDayLabel } from "@/lib/date";
import { getHolidays } from "@/lib/holidays";
import { getToday } from "@/lib/today";

// 홈. 남은 재뽑기·뽑기 버튼·칩·최근 기록은 TodayProvider가 불러온 오늘 상태로 채운다.
// 카드는 아직 '뽑기 전' 모양뿐이고, 버튼은 아직 동작하지 않는다.
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
            {/* 모바일: 제목 줄 오른쪽에 계정 메뉴(계정으로 로그인했을 때만) */}
            <div className="flex items-center justify-between">
              <h1
                id="home-title"
                className="font-hand text-[32px] leading-[1.1] font-bold lg:sr-only"
              >
                밍기적 챌린지
              </h1>
              <MobileAccountMenu />
            </div>
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

          <DrawActions />
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
