import type { Metadata } from "next";
import { termsOfService } from "@/components/legal/documents";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";

export const metadata: Metadata = {
  title: "서비스 이용약관 · 밍기적 챌린지",
};

// 서비스 이용약관. 세션이 없어도 열린다(proxy의 앱 화면 목록에 없다).
export default function TermsPage() {
  return <LegalDocumentView doc={termsOfService} />;
}
