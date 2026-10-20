import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// 링크를 공유할 때 보이는 이미지(1200×630). 빌드할 때 한 번 만들어 둔다.
// 손그림 필터는 쓸 수 없어 테두리는 단색 선으로, 도장은 PNG 원본으로 그린다.

export const alt = "밍기적 챌린지 - 하루 1개, 아주 작은 미션을 뽑아 해내고 도장을 모으는 그림일기 챌린지";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Gaegu Bold에서 이 이미지에 쓰는 글자만 남긴 글꼴(assets/fonts/README.md).
// 아래 문구를 바꾸면 글꼴도 다시 만들어야 한다. 없는 글자는 빈칸으로 나온다.
const TITLE = "밍기적 챌린지";
const CHIP = "하루 1분, 아주 작은 기적";
const LINES = ["오늘의 미션을 뽑아 해내고", "도장을 모으는 그림일기 챌린지"];

const INK = "#3A3A3A";
const INK_MUTED = "#6B6B6B";

const toDataUrl = (png: Buffer) => `data:image/png;base64,${png.toString("base64")}`;

export default async function OpengraphImage() {
  // 경로는 문자열 그대로 둔다. 조합하면 빌드가 프로젝트 전체를 서버 코드에 포함시킨다.
  const [font, mascot, stamp] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Gaegu-Bold-og.ttf")),
    readFile(join(process.cwd(), "public/images/mascot/tyrano-did-it.png")).then(toDataUrl),
    readFile(join(process.cwd(), "public/images/stamps/png/p01@4x.png")).then(toDataUrl),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 48,
          background: "#FFFFFF",
          fontFamily: "Gaegu",
          color: INK,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flex: 1,
            alignItems: "center",
            padding: "0 72px",
            border: `4px solid ${INK_MUTED}`,
            borderRadius: "44px 60px 40px 68px",
            background: "#FFFFFF",
          }}
        >
          {/* 카드 위쪽에 붙은 노란 테이프 */}
          <div
            style={{
              position: "absolute",
              top: -18,
              left: 520,
              width: 150,
              height: 40,
              background: "#F6C85F",
              opacity: 0.55,
              transform: "rotate(-4deg)",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "6px 22px",
                borderRadius: 999,
                background: "#FFF2D1",
                fontSize: 30,
              }}
            >
              {CHIP}
            </div>
            <div style={{ marginTop: 18, fontSize: 112, lineHeight: 1.05 }}>{TITLE}</div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 40, color: INK_MUTED }}>
              {LINES.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>

          <img src={mascot} alt="" width={210} height={249} style={{ position: "absolute", right: 250, bottom: 60 }} />
          <img src={stamp} alt="" width={230} height={230} style={{ position: "absolute", right: 48, bottom: 150 }} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Gaegu", data: font, style: "normal", weight: 700 }] },
  );
}
