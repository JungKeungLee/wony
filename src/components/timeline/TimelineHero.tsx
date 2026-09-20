export default function TimelineHero() {
  return (
    <section className="relative flex flex-col items-center gap-6 px-6 pb-16 pt-32 text-center sm:pt-40">
      <span className="font-display text-xs tracking-[0.4em] text-star">OUR YEAR</span>
      <h1 className="font-display text-4xl tracking-wide text-text sm:text-6xl">
        2026 TIMELINE
      </h1>
      <p className="font-serif-kr max-w-md text-base text-text-soft sm:text-lg">
        워니와 함께했던 열두 달의 순간들
      </p>
      <div className="mt-4 flex items-center gap-4 text-text-soft/50">
        <span className="h-px w-10 bg-text-soft/30" />
        <span className="font-display text-xs tracking-[0.3em]">JAN — DEC</span>
        <span className="h-px w-10 bg-text-soft/30" />
      </div>
    </section>
  );
}
