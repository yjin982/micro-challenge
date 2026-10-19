import { MobileAccountMenu } from "@/components/auth/MobileAccountMenu";
import { CalendarCard } from "@/components/home/CalendarCard";
import { RecentRecords } from "@/components/home/RecentRecords";
import { TodayPanel } from "@/components/home/TodayPanel";
import { TodayProvider } from "@/components/home/TodayProvider";
import { formatDayLabel } from "@/lib/date";
import { getHolidays } from "@/lib/holidays";
import { getToday } from "@/lib/today";

// 홈. TodayProvider가 불러온 오늘 상태로 왼쪽(TodayPanel: 뽑기 전·도전중·완료)과 칩·최근 기록을 채운다.
export default async function Home() {
  const today = await getToday();
  const holidays = await getHolidays(today);

  return (
    <TodayProvider>
      <main className="mx-auto w-full max-w-120 px-6 pt-6.5 pb-28 lg:flex lg:max-w-272 lg:gap-16 lg:pt-9 lg:pb-12">
        {/* 데스크톱: 오른쪽 열이 더 길면 카드 자리가 늘어나 두 열의 아래 끝을 맞춘다 */}
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

          <TodayPanel date={today} holidays={holidays} />
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
