import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import LettersHero from "@/components/letters/LettersHero";
import LetterGrid from "@/components/letters/LetterGrid";

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
        <LetterGrid />
      </main>
    </>
  );
}
