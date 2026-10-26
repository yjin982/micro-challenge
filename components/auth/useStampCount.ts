"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// 지금 계정의 누적 도장 수. 연결 실패 안내·로그아웃 확인에서 "도장 N개"를 쓰려고 대화상자를 열 때 한 번 불러온다.
// 불러오기 전이나 실패하면 null이다(문구에서 도장 수를 뺀다).
export function useStampCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    api
      .getToday()
      .then((today) => setCount(today.totalCompleted))
      .catch(() => setCount(null));
  }, []);

  return count;
}
