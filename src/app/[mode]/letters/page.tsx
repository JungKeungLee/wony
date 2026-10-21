import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import LettersHero from "@/components/letters/LettersHero";
import LetterGrid from "@/components/letters/LetterGrid";
import ChapterNote from "@/components/narrative/ChapterNote";
import NextChapter from "@/components/narrative/NextChapter";

export const metadata: Metadata = {
  title: "Letters to WONY | WONY",
  description: "2026년의 마지막, 워니에게 전하고 싶었던 이야기",
};

export default function LettersPage() {
  return (
    <>
      <Navigation />
      <main>
        <LettersHero />
        <ChapterNote lines={["올해 하지 못했던 말,", "그리고 꼭 전하고 싶었던 말.", "여기에 하나씩 남았습니다."]} />
        <LetterGrid />
        <NextChapter
          message={["어떤 마음은 글로 남았고,\n어떤 마음은 그림으로 남았습니다."]}
          title="그림으로 남은 마음 보기"
          href="/fan-art"
          transitionPhrase="이번에는 말 대신 그림을 펼쳐봅니다."
        />
      </main>
    </>
  );
}
