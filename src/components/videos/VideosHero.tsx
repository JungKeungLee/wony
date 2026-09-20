import Link from "next/link";

export default function VideosHero() {
  return (
    <section className="flex flex-col items-center gap-6 px-6 pb-14 pt-32 text-center sm:pt-40">
      <span className="font-display text-xs tracking-[0.4em] text-star">
        WONY CINEMA
      </span>
      <h1 className="font-display text-4xl tracking-wide text-text sm:text-6xl">
        VIDEO
      </h1>
      <p className="font-serif-kr max-w-md text-base text-text-soft sm:text-lg">
        2026년 우리의 순간을 영상으로
      </p>
      <Link
        href="/videos/write"
        className="mt-4 border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink"
      >
        [ 영상 등록하기 ]
      </Link>
    </section>
  );
}
