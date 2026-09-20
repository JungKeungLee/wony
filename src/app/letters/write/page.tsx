import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import LetterForm from "@/components/letters/LetterForm";

export const metadata: Metadata = {
  title: "편지 쓰기 | WONY",
  description: "워니에게 전하고 싶은 이야기를 편지로 남겨보세요.",
};

export default function LetterWritePage() {
  return (
    <>
      <Navigation />
      <main>
        <section className="flex flex-col items-center gap-4 px-6 pb-10 pt-32 text-center sm:pt-40">
          <span className="font-display text-xs tracking-[0.4em] text-star">
            WRITE
          </span>
          <h1 className="font-display text-3xl tracking-wide text-text sm:text-5xl">
            워니에게 편지 쓰기
          </h1>
        </section>
        <LetterForm />
      </main>
    </>
  );
}
