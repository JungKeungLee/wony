import Link from "next/link";

export default function VideosHero() {
  return (
    <section className="relative flex flex-col items-center gap-6 px-6 pb-14 pt-32 text-center sm:pt-40">
      <span className="font-display text-xs tracking-[0.4em] text-star">
        WONY CINEMA
      </span>
      <h1 className="font-display text-4xl tracking-wide text-text sm:text-6xl">
        2026 BEST CLIPS
      </h1>
      <p className="font-serif-kr max-w-md text-base text-text-soft sm:text-lg">
        워냥이들이 다시 보고 싶은 2026년의 순간들
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
