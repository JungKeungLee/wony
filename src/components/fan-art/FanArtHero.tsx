import Link from "next/link";
import HiddenStar from "@/components/effects/HiddenStar";

export default function FanArtHero() {
  return (
    <section className="relative flex flex-col items-center gap-6 px-6 pb-14 pt-32 text-center sm:pt-40">
      <HiddenStar id="fanArt" className="absolute right-5 top-20 sm:right-8 sm:top-24" />
      <span className="font-display text-xs tracking-[0.4em] text-star">
        ARTS FROM US
      </span>
      <h1 className="font-display text-4xl tracking-wide text-text sm:text-6xl">
        WONY FAN ART GALLERY
      </h1>
      <p className="font-serif-kr max-w-md text-base text-text-soft sm:text-lg">
        팬들의 마음으로 완성된 또 하나의 워니
      </p>
      <Link
        href="/fan-art/write"
        className="mt-4 border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink"
      >
        [ 팬아트 보내기 ]
      </Link>
    </section>
  );
}
