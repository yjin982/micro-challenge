import { RecordsView } from "@/components/records/RecordsView";
import { getHolidays } from "@/lib/holidays";
import { getToday } from "@/lib/today";
import packageJson from "@/package.json";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// 기록: 월간 달력, 누적·연속 칩, 날짜 상세, 앱 정보.
// 보여줄 달은 ?month=YYYY-MM으로 받고, 없거나 잘못됐거나 이번 달 이후면 이번 달을 보여준다.
// 공휴일은 서버에서 조회하고, 기록은 RecordsView가 브라우저에서 불러온다.
export default async function RecordsPage({ searchParams }: PageProps<"/records">) {
  const today = await getToday();
  const currentMonth = today.slice(0, 7);
  const { month: param } = await searchParams;
  const month =
    typeof param === "string" && MONTH_PATTERN.test(param) && param < currentMonth ? param : currentMonth;

  const holidays = await getHolidays(`${month}-01`);

  return (
    <RecordsView
      key={month}
      month={month}
      currentMonth={currentMonth}
      today={today}
      holidays={holidays}
      version={packageJson.version}
    />
  );
}
