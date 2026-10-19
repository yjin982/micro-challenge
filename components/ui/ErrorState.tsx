import Image from "next/image";
import { Button } from "./Button";
import { StateCard } from "./StateCard";

// 오류 화면(화면 설계 '공통 상태 > 오류'): 고민하는 마스코트, 안내 문구, 다시 시도 버튼.
// error.tsx와 global-error.tsx가 함께 쓴다.
export function ErrorState({
  onRetry,
  title = "앗, 잠깐 문제가 생겼어요",
  description = "인터넷 연결을 확인하고 다시 시도해 주세요",
}: {
  onRetry: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <StateCard role="alert">
      <Image src="/images/mascot/tyrano-thinking.png" alt="" width={144} height={175} className="h-auto w-36" />
      <h2 className="text-center font-hand text-[28px] leading-tight font-bold">{title}</h2>
      <p className="text-center text-[13px] text-ink-muted">{description}</p>
      <div className="mt-1 w-50">
        <Button onClick={onRetry}>다시 시도</Button>
      </div>
    </StateCard>
  );
}
