// API 응답 타입. 모양은 서버 설계 문서 '요청과 응답'과 DB 함수 today_state·get_month를 따른다.

export type StampId = "p01" | "p02" | "p03" | "p04" | "p05" | "p06";

export type Mission = {
  id: string;
  text: string;
  difficulty: "easy" | "challenge";
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
  // 처음 쓴 달. 기록이 하나도 없으면 null
  firstMonth: string | null;
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
