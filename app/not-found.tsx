import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { StateCard, StateMain } from "@/components/ui/StateCard";

// 없는 주소로 들어왔을 때. 헤더와 하단 탭은 레이아웃이라 그대로 남는다.
export default function NotFound() {
  return (
    <StateMain>
      <StateCard>
        <Image src="/images/mascot/tyrano-hard.png" alt="" width={153} height={174} loading="eager" className="h-auto w-38" />
        <h1 className="text-center font-hand text-[28px] leading-tight font-bold">페이지를 찾을 수 없어요</h1>
        <p className="text-center text-[13px] text-ink-muted">주소가 바뀌었거나 없어진 페이지예요</p>
        <div className="mt-1 w-50">
          <ButtonLink href="/">홈으로 가기</ButtonLink>
        </div>
      </StateCard>
    </StateMain>
  );
}
