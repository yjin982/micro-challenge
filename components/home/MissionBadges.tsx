import { Badge } from "@/components/ui/Badge";
import type { Mission } from "@/types/api";

// 도전중 카드 머리의 배지 줄: 항상 '오늘의 미션', 도전적 미션이면 '도전'을 덧붙인다.
export function MissionBadges({ difficulty }: { difficulty: Mission["difficulty"] }) {
  return (
    <div className="flex items-center gap-2">
      <Badge tone="today">오늘의 미션</Badge>
      {difficulty === "challenge" && <Badge tone="challenge">도전</Badge>}
    </div>
  );
}
