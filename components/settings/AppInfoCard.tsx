import type { ReactNode } from "react";
import { ChevronRightIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { SketchFrame } from "@/components/ui/sketch";

const rowClass =
  "flex min-h-13 w-full items-center justify-between gap-3 border-b-[1.5px] border-dashed border-line-faint text-left text-[15px]";

// 설정 · 앱 정보 카드. 버전, 만든 사람, 피드백, 개인정보처리방침, 서비스 이용약관.
// 피드백(연결할 곳을 아직 정하지 않음)과 처리방침·약관(페이지가 아직 없음, 로그인 계획 4D단계)은
// 지금은 동작이 없는 버튼으로 둔다. 연결할 곳이 생기면 바깥 링크(새 탭)와 페이지 링크로 바꾼다.
export function AppInfoCard({ version }: { version: string }) {
  return (
    <div className="relative bg-paper px-5">
      <SketchFrame />
      <ul className="[&>li:last-child>*]:border-b-0">
        <li>
          <InfoRow label="버전" value={version} />
        </li>
        <li>
          <InfoRow label="만든 사람" value="유진" />
        </li>
        <li>
          <ActionRow label="피드백 보내기" icon={<ExternalLinkIcon className="size-5" />} />
        </li>
        <li>
          <ActionRow label="개인정보처리방침" icon={<ChevronRightIcon className="size-5" />} />
        </li>
        <li>
          <ActionRow label="서비스 이용약관" icon={<ChevronRightIcon className="size-5" />} />
        </li>
      </ul>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={rowClass}>
      <span>{label}</span>
      <span className="text-ink-muted">{value}</span>
    </div>
  );
}

function ActionRow({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <button type="button" className={rowClass}>
      <span>{label}</span>
      <span className="text-ink-faint">{icon}</span>
    </button>
  );
}
