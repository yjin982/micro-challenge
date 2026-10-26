import type { Metadata } from "next";
import { privacyPolicy } from "@/components/legal/documents";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";

export const metadata: Metadata = {
  title: "개인정보처리방침 · 밍기적 챌린지",
};

// 개인정보처리방침. 세션이 없어도 열린다(proxy의 앱 화면 목록에 없다). Google 로그인 브랜딩에 이 주소를 넣는다.
export default function PrivacyPage() {
  return <LegalDocumentView doc={privacyPolicy} />;
}
