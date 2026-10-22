"use client";

import { useEffect, useState } from "react";
import { MobileAccountMenu } from "@/components/auth/MobileAccountMenu";
import { SketchFrame } from "@/components/ui/sketch";
import { StatChips, StatChipsSkeleton } from "@/components/ui/StatChips";
import { api } from "@/lib/api";
import { lastDateOfMonth } from "@/lib/date";
import type { Holidays } from "@/lib/holidays";
import { useDayCheck, useServerDateSync } from "@/lib/useDaySync";
import type { MonthRecords, StampId, TodayState } from "@/types/api";
import { MonthGrid } from "./MonthGrid";
import { MonthNav } from "./MonthNav";
import { RecordDetail, type RecordDetailData } from "./RecordDetail";
import { RecordsEmpty } from "./RecordsEmpty";
import { TodayMonthLink } from "./TodayMonthLink";

type Loaded = { today: TodayState; records: MonthRecords };

// 처음 고를 날짜: 이번 달이면 오늘, 지난달이면 그 달 마지막 기록(없으면 말일)
function defaultDate(month: string, currentMonth: string, { today, records }: Loaded) {
  if (month === currentMonth) return today.date;
  return records.days.at(-1)?.date ?? lastDateOfMonth(month);
}

function toDetail(date: string, { today, records }: Loaded): RecordDetailData {
  const day = records.days.find((d) => d.date === date);
  if (day) return { kind: "done", ...day };
  if (date === today.date) {
    return { kind: "today", date, missionText: today.state === "challenge" ? (today.mission?.text ?? null) : null };
  }
  return { kind: "rest", date };
}

// 기록 화면 본문. 오늘 상태(누적·연속)와 그 달 기록을 브라우저에서 /api로 불러온다.
// 달이 바뀌면 페이지가 key로 새로 마운트해 다시 불러오고 선택도 초기화한다.
// today·currentMonth는 서버가 그릴 때 쓴 날짜(getToday)다. API 날짜와 다르면 서버 부분을 새로 그리고, 그 뒤 다시 불러온다.
export function RecordsView({
  month,
  currentMonth,
  today,
  holidays,
  version,
}: {
  month: string;
  currentMonth: string;
  today: string;
  holidays: Holidays;
  version: string;
}) {
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.getToday(), api.getMonth(month)])
      .then(([todayState, records]) => {
        if (active) setData({ today: todayState, records });
      })
      .catch((reason: unknown) => {
        if (active) setError(reason);
      });
    return () => {
      active = false;
    };
  }, [month, today]);

  // API 날짜가 기준이다. 서버가 그린 오늘 표시·이번 달·공휴일이 그와 다르면(자정 무렵) 새로 그린다.
  useServerDateSync(today, data?.today.date);

  // 화면에 돌아오거나 자정이 지나면 오늘 날짜를 다시 확인한다. 바뀌었으면 위의 동기화가 서버 부분을 새로 그리고,
  // 바뀐 today로 기록도 다시 불러온다.
  useDayCheck(async () => {
    if (!data) return;
    try {
      const next = await api.getToday();
      setData((prev) => (prev ? { ...prev, today: next } : prev));
    } catch (reason) {
      console.error("[records] 오늘 상태 다시 확인 실패", reason); // 다음 확인 때 다시 한다
    }
  });

  // 불러오기 실패는 app/error.tsx의 오류 화면으로 넘긴다.
  if (error) throw error;

  const isEmpty = data?.today.totalCompleted === 0;
  const stamps: Record<string, StampId> = Object.fromEntries(data?.records.days.map((d) => [d.date, d.stampId]) ?? []);
  const selected = data && !isEmpty ? (picked ?? defaultDate(month, currentMonth, data)) : null;
  // 처음 쓴 달 이전으로는 넘기지 않는다. 기록을 불러오기 전이나 한 번도 쓰지 않았으면 막아 둔다.
  const firstMonth = data?.records.firstMonth;
  const canGoPrev = !!firstMonth && month > firstMonth;

  return (
    <main className="mx-auto w-full max-w-120 px-6 pt-6.5 pb-28 lg:flex lg:max-w-272 lg:gap-16 lg:pt-7.5 lg:pb-12">
      {/* 모바일: 제목 줄 오른쪽에 계정 메뉴(계정으로 로그인했을 때만).
          데스크톱에서는 main이 가로 flex라 이 줄이 빈 항목으로 자리(와 gap)를 차지하지 않도록 contents로 푼다 */}
      <div className="flex items-center justify-between lg:contents">
        <h1 className="font-hand text-[32px] leading-[1.1] font-bold lg:sr-only">기록</h1>
        <MobileAccountMenu />
      </div>

      <section aria-labelledby="records-month" className="lg:flex lg:w-160 lg:shrink-0 lg:flex-col lg:gap-3">
        <div className="mt-2.5 flex flex-col gap-1.5 lg:mt-0 lg:flex-row lg:items-center lg:justify-between">
          <MonthNav month={month} currentMonth={currentMonth} canGoPrev={canGoPrev} />
          {/* '오늘' 버튼: 모바일은 칩 줄 오른쪽 끝, 데스크톱은 칩 왼쪽 */}
          <div className="flex items-center justify-between lg:gap-3">
            {data ? <StatChips total={data.today.totalCompleted} streak={data.today.streak} /> : <StatChipsSkeleton />}
            {month !== currentMonth && <TodayMonthLink className="lg:order-first" />}
          </div>
        </div>

        <div className="relative mt-3 flex flex-col gap-2 bg-paper px-3.5 pt-3.5 pb-3 lg:mt-0 lg:px-4.5 lg:pt-4 lg:pb-3.5">
          <SketchFrame />
          <MonthGrid
            month={`${month}-01`}
            today={today}
            holidays={holidays}
            stamps={stamps}
            selected={selected}
            onSelect={data && !isEmpty ? setPicked : undefined}
            variant="records"
          />
        </div>
      </section>

      <div className="mt-3.5 flex flex-col lg:mt-0 lg:w-84 lg:shrink-0 lg:pt-14">
        {isEmpty ? <RecordsEmpty /> : <RecordDetail detail={data && selected ? toDetail(selected, data) : null} />}
        {data && !isEmpty && (
          <p className="mt-3 hidden text-center text-xs text-ink-muted lg:block">
            지난 날짜를 누르면 그날의 기록을 볼 수 있어요
          </p>
        )}
        <p className="mt-3.5 text-center text-xs text-ink-muted lg:mt-7">버전 {version} · 만든 사람 유진</p>
      </div>
    </main>
  );
}
