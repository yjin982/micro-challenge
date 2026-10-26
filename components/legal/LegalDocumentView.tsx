import { BackButton } from "@/components/ui/BackButton";
import { SketchFrame } from "@/components/ui/sketch";
import type { LegalDocument } from "./documents";

// 개인정보처리방침·서비스 이용약관 화면(보드: 개인정보처리방침 모바일·데스크톱, 서비스 이용약관).
// 모바일은 도화지 위에 "< 제목"과 본문, 데스크톱은 가운데 손그림 카드 안에 본문을 둔다.
// 세션이 없어도 열린다(시작 화면 링크). 뒤로 갈 곳이 없으면 시작 화면으로 가고, 세션이 있으면 proxy가 홈으로 보낸다.
export function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  return (
    <main className="mx-auto w-full max-w-120 px-6 pt-5 pb-28 lg:max-w-205 lg:pt-7 lg:pb-12">
      <article className="lg:relative lg:bg-paper lg:px-12 lg:pt-11 lg:pb-12">
        <div className="hidden lg:contents">
          <SketchFrame />
        </div>
        <div className="flex items-center gap-1">
          <BackButton fallbackHref="/welcome" />
          <h1 className="font-hand text-[30px] leading-[1.1] font-bold lg:text-4xl">{doc.title}</h1>
        </div>
        <p className="mt-2 text-[13px] text-ink-muted lg:mt-3">시행일 {doc.effectiveDate}</p>
        <p className="mt-3 text-[15px] leading-relaxed">{doc.intro}</p>

        <ol className="mt-2">
          {doc.sections.map((section, index) => (
            <li key={section.heading} className="mt-6">
              <h2 className="text-[17px] font-bold">
                {index + 1}. {section.heading}
              </h2>
              <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed marker:text-ink">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </article>
    </main>
  );
}
