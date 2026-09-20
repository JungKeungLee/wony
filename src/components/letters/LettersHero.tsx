import Link from "next/link";
import HiddenStar from "@/components/effects/HiddenStar";

export default function LettersHero() {
  return (
    <section className="relative flex flex-col items-center gap-6 px-6 pb-14 pt-32 text-center sm:pt-40">
      <HiddenStar
        id="letter"
        variant="letter-heading"
        className="absolute right-5 top-20 sm:right-8 sm:top-24"
      />
      <span className="font-display text-xs tracking-[0.4em] text-star">
        DEAR WONY
      </span>
      <h1 className="font-display text-4xl tracking-wide text-text sm:text-6xl">
        LETTERS TO WONY
      </h1>
      <p className="font-serif-kr max-w-md text-base text-text-soft sm:text-lg">
        2026년의 마지막,
        <br />
        워니에게 전하고 싶었던 이야기
      </p>
      <div className="relative mt-4 inline-flex">
        <HiddenStar
          id="letter"
          variant="letter-write"
          className="absolute -right-9 top-1/2 -translate-y-1/2"
        />
        <Link
          href="/letters/write"
          className="border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink"
        >
          편지 쓰기
        </Link>
      </div>
    </section>
  );
}
