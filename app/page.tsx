import { MobileAccountMenu } from "@/components/auth/MobileAccountMenu";
import { RecentRecords } from "@/components/home/RecentRecords";
import { TodayPanel } from "@/components/home/TodayPanel";
import { TodayProvider } from "@/components/home/TodayProvider";
import { WeekStrip } from "@/components/home/WeekStrip";
import { formatDayLabel, getWeekDates } from "@/lib/date";
import { getHolidaysForDates } from "@/lib/holidays";
import { getToday } from "@/lib/today";

// 홈. TodayProvider가 불러온 오늘 상태로 왼쪽(TodayPanel: 뽑기 전·도전중·완료)과 이번 주 7일 줄·최근 기록을 채운다.
// 월간 달력은 기록 화면에만 둔다(홈은 오늘과 이번 주).
export default async function Home() {
  const today = await getToday();
  // 이번 주가 두 달에 걸치면 두 달의 공휴일을 합친다
  const holidays = await getHolidaysForDates(getWeekDates(today));

  return (
    <TodayProvider serverDate={today}>
      <main className="mx-auto w-full max-w-120 px-6 pt-6.5 pb-28 lg:flex lg:max-w-272 lg:gap-16 lg:pt-9 lg:pb-12">
        <section aria-labelledby="home-title" className="lg:w-110 lg:shrink-0">
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

        {/* 데스크톱 오른쪽 열은 왼쪽 소제목(32px)과 카드 위 여백(18px)만큼 내려 카드 윗선에 맞춘다. 그 위는 비워 둔다 */}
        <div className="lg:min-w-0 lg:flex-1 lg:pt-12.5">
          <div className="hidden lg:block">
            <WeekStrip today={today} holidays={holidays} />
          </div>
          <RecentRecords />
        </div>
      </main>
    </TodayProvider>
  );
}
