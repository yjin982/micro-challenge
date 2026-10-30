// API 응답 타입. 모양은 서버 설계 문서 '요청과 응답'과 DB 함수 today_state·get_month를 따른다.

export type StampId = "p01" | "p02" | "p03" | "p04" | "p05" | "p06" | "p07" | "p08" | "p09" | "p10" | "p11" | "p12";

export type Mission = {
  id: string;
  text: string;
  difficulty: "easy" | "challenge";
  // 내부 분류(몸/행동, 인지/생각 등). 도전중 카드의 낙서 장식을 고른다. 분류가 없는 미션은 null
  category: string | null;
};

export type RecentRecord = {
  date: string;
  missionText: string;
  stampId: StampId;
};

// GET /api/today, POST /api/today/{draw,reroll,complete}
export type TodayState = {
  date: string;
  state: "not_drawn" | "challenge" | "done";
  mission: Mission | null;
  rerollsLeft: number;
  completedAt: string | null;
  stampId: StampId | null;
  // 오늘 완료하며 남긴 메모(없으면 null). 홈 완료 카드에 보여준다
  note: string | null;
  streak: number;
  totalCompleted: number;
  recent: RecentRecord[];
};

// GET /api/records?month=YYYY-MM
export type MonthRecords = {
  month: string;
  // 이전 달로 넘길 수 있는 첫 달: 첫 기록 달과 시작한 달 중 이른 달. 기록·계정 정보가 없으면 null
  firstMonth: string | null;
  // 시작한 날(계정을 만든 날, YYYY-MM-DD). 달력에 작은 티라노로 표시한다.
  // 20261030020000_start_date.sql 실행 전의 API에는 없다(그때는 표시하지 않는다)
  startDate?: string | null;
  days: {
    date: string;
    missionText: string;
    stampId: StampId;
    completedAt: string;
    // 그날 남긴 메모(없으면 null)
    note: string | null;
  }[];
};

// PATCH /api/records/note. note가 null이면 지운 것
export type NoteResult = {
  date: string;
  note: string | null;
  noteUpdatedAt: string | null;
};

// POST /api/account/delete. 나중에 Google 연결 해제를 붙이면 그 결과를 여기에 더한다
export type DeleteAccountResult = {
  deleted: true;
};

export type ErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_INPUT"
  | "DAY_CHANGED"
  | "ALREADY_DRAWN"
  | "NOT_DRAWN"
  | "NO_REROLLS"
  | "ALREADY_COMPLETED"
  | "NOT_FOUND"
  | "INTERNAL";

export type ApiErrorBody = {
  error: { code: ErrorCode; message: string };
};
