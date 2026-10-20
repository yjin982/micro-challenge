import Image from "next/image";
import { Button } from "./Button";
import { StateCard } from "./StateCard";

const messages = {
  // 서버까지 닿지 못함(오프라인 등). 문구는 화면 설계 '공통 상태 > 오류'
  offline: { title: "앗, 연결이 잠깐 끊겼어요", description: "인터넷 연결을 확인하고 다시 시도해 주세요" },
  // 서버 오류나 그 밖의 문제
  other: { title: "앗, 잠깐 문제가 생겼어요", description: "잠시 후 다시 시도해 주세요" },
} as const;

// 오류 화면(화면 설계 '공통 상태 > 오류'): 지쳐 뻗은 마스코트, 원인에 맞는 안내 문구, 다시 시도 버튼.
// error.tsx와 global-error.tsx가 함께 쓴다.
export function ErrorState({ onRetry, offline = false }: { onRetry: () => void; offline?: boolean }) {
  const { title, description } = messages[offline ? "offline" : "other"];
  return (
    <StateCard role="alert">
      <Image src="/images/mascot/tyrano-fail.png" alt="" width={195} height={164} className="h-auto w-40" />
      <h2 className="text-center font-hand text-[28px] leading-tight font-bold">{title}</h2>
      <p className="text-center text-[13px] text-ink-muted">{description}</p>
      <div className="mt-1 w-50">
        <Button onClick={onRetry}>다시 시도</Button>
      </div>
    </StateCard>
  );
}
