import "server-only";
import { unstable_cache } from "next/cache";

// 한국천문연구원 특일 정보제공 서비스의 국경일 정보조회(getHoliDeInfo).
// 공휴일 정보조회(getRestDeInfo)의 항목(설날·추석, 대체공휴일, 임시공휴일 등)을 모두 포함하고,
// 쉬지 않는 국경일(2025년까지의 제헌절)도 isHoliday=N으로 들어 있다(2020–2027년 비교로 확인).
const ENDPOINT = "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo";

// 임시공휴일은 지정되면 하루 안에 반영되므로 하루마다 다시 받는다.
const REVALIDATE_SECONDS = 86_400;
const TIMEOUT_MS = 3_000;

// 날짜(YYYY-MM-DD) → 특일. 같은 날 둘이면 이름을 " · "로 잇고, 하나라도 쉬는 날이면 쉬는 날이다.
export type Holiday = { name: string; isHoliday: boolean };
export type Holidays = Record<string, Holiday>;

type HolidayItem = {
  locdate: number | string;
  dateName: string;
  isHoliday: string;
};

// 항목이 1개면 배열이 아니라 객체로, 0개면 items가 빈 문자열로 온다.
type HolidayResponse = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: { items?: { item?: HolidayItem | HolidayItem[] } | "" };
  };
};

// 실패하면 예외를 던져 캐시에 남지 않게 한다. 키 오류도 HTTP 200에 XML 본문으로 오는 경우가 있다.
const fetchHolidays = unstable_cache(
  async (year: string, month: string): Promise<Holidays> => {
    const key = process.env.HOLIDAY_API_KEY ?? "";
    const params = new URLSearchParams({
      // 포털의 Encoding 키를 넣어도 두 번 인코딩되지 않도록 풀어서 쓴다.
      ServiceKey: key.includes("%") ? decodeURIComponent(key) : key,
      solYear: year,
      solMonth: month,
      numOfRows: "50",
      _type: "json",
    });

    const res = await fetch(`${ENDPOINT}?${params}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);

    let data: HolidayResponse;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`JSON이 아닌 응답: ${text.slice(0, 200)}`);
    }

    const header = data.response?.header;
    if (header?.resultCode !== "00") {
      throw new Error(`resultCode ${header?.resultCode}: ${header?.resultMsg}`);
    }

    const items = data.response?.body?.items;
    const list = items ? [items.item ?? []].flat() : [];

    const holidays: Holidays = {};
    for (const { locdate, dateName, isHoliday } of list) {
      const d = String(locdate);
      const date = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
      const prev = holidays[date];
      holidays[date] = {
        name: prev ? `${prev.name} · ${dateName}` : dateName,
        isHoliday: (prev?.isHoliday ?? false) || isHoliday === "Y",
      };
    }
    return holidays;
  },
  ["holidays"],
  { revalidate: REVALIDATE_SECONDS },
);

// 해당 날짜가 속한 달의 국경일·공휴일. 키가 없거나 호출이 실패하면 빈 값을 돌려 달력은 공휴일 없이 그린다.
export async function getHolidays(date: string): Promise<Holidays> {
  if (!process.env.HOLIDAY_API_KEY) {
    console.warn("[holidays] HOLIDAY_API_KEY가 없어 공휴일을 표시하지 않습니다.");
    return {};
  }

  const [year, month] = date.split("-");
  try {
    return await fetchHolidays(year, month);
  } catch (error) {
    console.error("[holidays] 공휴일을 불러오지 못했습니다.", error);
    return {};
  }
}

// 여러 날짜가 걸친 달들의 국경일·공휴일을 합친다(홈의 이번 주가 두 달에 걸칠 때)
export async function getHolidaysForDates(dates: string[]): Promise<Holidays> {
  const months = [...new Set(dates.map((date) => date.slice(0, 7)))];
  const results = await Promise.all(months.map((month) => getHolidays(`${month}-01`)));
  return Object.assign({}, ...results);
}
