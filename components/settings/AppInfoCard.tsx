import Link from "next/link";
import { ChevronRightIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { SketchFrame } from "@/components/ui/sketch";
import { FEEDBACK_URL } from "@/lib/links";

const rowClass =
  "flex min-h-13 w-full items-center justify-between gap-3 border-b-[1.5px] border-dashed border-line-faint text-left text-[15px]";

// 설정 · 앱 정보 카드. 버전, 만든 사람, 피드백(GitHub Issues, 새 탭), 개인정보처리방침, 서비스 이용약관.
export function AppInfoCard({ version }: { version: string }) {
  return (
    <div className="relative bg-paper px-5">
      <SketchFrame />
      <ul className="[&>li:last-child>*]:border-b-0">
        <li>
          <InfoRow label="버전" value={version} />
        </li>
        <li>
          <InfoRow label="만든 사람" value="Yujin Jeong" />
        </li>
        <li>
          <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className={rowClass}>
            <span>피드백 보내기</span>
            <span className="text-ink-faint">
              <ExternalLinkIcon className="size-5" />
            </span>
            <span className="sr-only">(새 탭)</span>
          </a>
        </li>
        <li>
          <PageRow href="/privacy" label="개인정보처리방침" />
        </li>
        <li>
          <PageRow href="/terms" label="서비스 이용약관" />
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

function PageRow({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={rowClass}>
      <span>{label}</span>
      <span className="text-ink-faint">
        <ChevronRightIcon className="size-5" />
      </span>
    </Link>
  );
}
