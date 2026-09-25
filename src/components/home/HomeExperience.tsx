import Navigation from "@/components/layout/Navigation";
import Hero from "@/components/hero/Hero";
import NextChapter from "@/components/narrative/NextChapter";

/** Hero의 시네마틱 오프닝(WONY → 부제 → 태그라인)이 끝난 뒤 Navigation이 나타나는 시점(초). */
const NAV_REVEAL_DELAY = 1.3;

export default function HomeExperience() {
  return (
    <>
      <Navigation revealDelay={NAV_REVEAL_DELAY} />
      <main>
        <Hero />
        <NextChapter
          message={[
            "2026년,\n우리에게는 참 많은 순간들이 있었습니다.",
            "웃었던 날도,\n정신없이 지나간 날도,\n모두 우리의 이야기가 되었습니다.",
          ]}
          title="2026년의 이야기 시작하기 ✦"
          href="/timeline"
          transitionPhrase="그 해의 시간을 다시 걸어봅니다."
        />
      </main>
    </>
  );
}
