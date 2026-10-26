"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// 지금 계정의 누적 도장 수. 연결 실패 안내·로그아웃 확인에서 "도장 N개"를 쓰려고 열 때 한 번 불러온다.
// loaded: 불러오기가 끝났는지(성공·실패 모두). count: 도장 수, 불러오기 전이나 실패하면 null(문구에서 도장 수를 뺀다).
export function useStampCount() {
  const [state, setState] = useState<{ count: number | null; loaded: boolean }>({ count: null, loaded: false });

  useEffect(() => {
    api
      .getToday()
      .then((today) => setState({ count: today.totalCompleted, loaded: true }))
      .catch(() => setState({ count: null, loaded: true }));
  }, []);

  return state;
}
