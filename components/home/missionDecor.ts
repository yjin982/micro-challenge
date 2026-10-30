import type { DoodleName } from "@/components/ui/Doodle";
import type { Mission } from "@/types/api";

// 도전중 카드의 낙서 장식(2026-10-30).
// - 무엇을: 미션 분류마다 정한 장식 셋 + 공통 장식 하나 중 3~4개. 같은 분류는 늘 같은 장식 묶음이라 분류의 신호가 된다
// - 어디에: 미션 ID로 정해지는 무작위(같은 미션은 새로고침해도, 서버·브라우저에서 그려도 늘 같은 배치).
//   배지·미션 문구·티라노 자리는 피하고, 장식끼리는 중심이 MIN_GAP 이상 떨어진다.
//   화면에서 위치를 재지 않고 숫자로만 계산해서(카드 1장 약 0.01ms) 깜빡임이 없다.
//
// [고칠 때 주의] 아래 '피할 자리' 숫자는 지금 카드 모양에 맞춘 값이다. 다음을 바꾸면 이 숫자도 함께 고친다.
//   - 카드 크기·안쪽 여백(CardStack의 CARD_SLOT, MissionCard의 px·pt·pb) → CARD_W·CARD_H, TEXT_TOP
//   - 배지 모양·문구(MissionBadges) → BADGES
//   - 미션 문구 글자 크기·줄 간격(MissionCard의 text-[29px]·leading) → LINE_HEIGHT, CHARS_PER_LINE
//   - 티라노 크기·자리(MissionCard의 w-26·right-4·bottom-3.5) → MASCOT
// 고친 뒤에는 시드 미션 전부를 MissionCard로 그리는 임시 페이지를 만들어 데스크톱·390·360·320px에서
// 장식 사각형이 문구 줄(Range.getClientRects)·티라노·배지와 겹치지 않는지, 카드 밖으로 나가지 않는지 재 보고 페이지를 지운다
// (2026-10-30 기준 200장 모두 겹침 0, 장식 3~4개 194장·2개 6장).
type DecorSet = readonly [DoodleName, DoodleName, DoodleName];

const DECOR_BY_CATEGORY: Record<string, DecorSet> = {
  "몸/행동": ["sun", "sprout", "paw"],
  "인지/생각": ["cloud", "shooting-star", "bubbles"],
  "감정/자기표현": ["hearts", "tulip", "ribbon"],
  "환경 상호작용": ["bee", "cat-walk", "duck"],
  "디지털/습관": ["moon", "cat-sleep", "note"],
  "이상한 행동/밈": ["swirl", "jellyfish", "bunny"],
  도전적: ["star-orange", "shooting-star", "sparkle"],
};

// 분류가 없거나(미션 제안분) 모르는 분류일 때
const DEFAULT_DECOR: DecorSet = ["star", "flower", "heart"];
// 분류 장식에 하나 섞는 공통 장식
const ACCENTS: DoodleName[] = ["sparkle", "star", "swirl", "heart", "flower"];

// 배치는 카드 안 비율(%) 좌표로 계산한다. 장식·티라노·배지는 px 크기라 카드가 좁을수록 비율이 커지므로,
// 가장 좁은 카드(320px 폰, 272×296)를 기준으로 계산한다. 더 넓은 카드에서는 여유가 더 생길 뿐이다
const CARD_W = 272;
const CARD_H = 296;
// 장식 중심끼리 최소 거리(% 좌표)
const MIN_GAP = 25;
// 피할 자리(% 사각형). 배지 줄은 왼쪽 위('오늘의 미션', 도전 미션은 '도전'까지), 티라노는 오른쪽 아래에 고정(MissionCard)
const BADGES = {
  easy: { left: 0, top: 0, right: 44, bottom: 22 },
  challenge: { left: 0, top: 0, right: 64, bottom: 22 },
};
const MASCOT = { left: 49, top: 52, right: 100, bottom: 100 };
// 미션 문구: 배지 아래에서 시작해 한 줄에 약 12.5%씩. 줄 수는 글자 수로 어림한다(가장 좁은 폰 기준 한 줄 9자쯤이라 넉넉히)
const TEXT_TOP = 18;
const LINE_HEIGHT = 12.5;
const CHARS_PER_LINE = 9;

function textZone(text: string) {
  const lines = Math.min(3, Math.max(1, Math.ceil(text.length / CHARS_PER_LINE)));
  return { left: 0, top: TEXT_TOP, right: 100, bottom: TEXT_TOP + 5 + lines * LINE_HEIGHT };
}

export type DecorPlacement = {
  name: DoodleName;
  left: number; // %
  top: number; // %
  size: number; // px
  rotate: number; // 도
  flip: boolean;
};

// 문자열 → 0~1 난수열. 같은 문자열이면 늘 같은 수열
function seededRandom(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const overlaps = (a: { left: number; top: number; right: number; bottom: number }, b: typeof a) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

// 분류를 내려주기 전의 API(20261030010000_mission_category.sql 실행 전)는 category가 없어 기본 장식이 된다
export function decorLayout({ id, category, text, difficulty }: Mission): DecorPlacement[] {
  const rand = seededRandom(id);
  const keepOut = [BADGES[difficulty], MASCOT, textZone(text)];
  const set = (category && DECOR_BY_CATEGORY[category]) || DEFAULT_DECOR;
  const accents = ACCENTS.filter((name) => !set.includes(name));
  const names = [...set, accents[Math.floor(rand() * accents.length)]].slice(0, 3 + Math.floor(rand() * 2));

  const placed: DecorPlacement[] = [];
  for (const name of names) {
    const size = 24 + Math.round(rand() * 14);
    const w = (size / CARD_W) * 100;
    const h = (size / CARD_H) * 100;
    // 자리를 찾을 때까지 몇 번 다시 뽑고, 끝내 못 찾으면 그 장식은 뺀다
    for (let attempt = 0; attempt < 400; attempt++) {
      const left = 3 + rand() * (94 - w);
      const top = 5 + rand() * (91 - h);
      const box = { left, top, right: left + w, bottom: top + h };
      const cx = left + w / 2;
      const cy = top + h / 2;
      if (keepOut.some((zone) => overlaps(box, zone))) continue;
      const tooClose = placed.some(
        (p) => Math.hypot(p.left + (p.size / CARD_W) * 50 - cx, p.top + (p.size / CARD_H) * 50 - cy) < MIN_GAP,
      );
      if (tooClose) continue;
      placed.push({ name, left, top, size, rotate: Math.round(-25 + rand() * 50), flip: rand() < 0.3 });
      break;
    }
  }
  return placed;
}
