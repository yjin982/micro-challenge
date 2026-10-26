import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/SettingsView";
import packageJson from "@/package.json";

export const metadata: Metadata = {
  title: "설정 · 밍기적 챌린지",
};

// 설정: 계정(익명·Google·개발용 이메일), 앱 정보, 계정 삭제. 계정 상태는 브라우저에서 확인한다(useAccount).
// 세션이 없으면 proxy가 /welcome으로 보낸다.
export default function SettingsPage() {
  return <SettingsView version={packageJson.version} />;
}
