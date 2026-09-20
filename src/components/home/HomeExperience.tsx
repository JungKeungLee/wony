import Navigation from "@/components/layout/Navigation";
import Hero from "@/components/hero/Hero";
import PreviewSection from "@/components/sections/PreviewSection";

/** Hero의 시네마틱 오프닝(WONY → 부제 → 태그라인)이 끝난 뒤 Navigation이 나타나는 시점(초). */
const NAV_REVEAL_DELAY = 1.3;

export default function HomeExperience() {
  return (
    <>
      <Navigation revealDelay={NAV_REVEAL_DELAY} />
      <main>
        <Hero />
        <PreviewSection />
      </main>
    </>
  );
}
