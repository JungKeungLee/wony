import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import FanArtHero from "@/components/fan-art/FanArtHero";
import FanArtGallery from "@/components/fan-art/FanArtGallery";
import ChapterNote from "@/components/narrative/ChapterNote";
import NextChapter from "@/components/narrative/NextChapter";

export const metadata: Metadata = {
  title: "WONY Fan Art Gallery | WONY",
  description: "팬들의 마음으로 완성된 또 하나의 워니",
};

export default function FanArtPage() {
  return (
    <>
      <Navigation />
      <main>
        <FanArtHero />
        <ChapterNote lines={["말 대신 그림으로 남겨진 마음들."]} />
        <FanArtGallery />
        <ChapterNote lines={["한 장 한 장,", "누군가의 시간이 담겨 있습니다."]} />
        <NextChapter
          message={[
            "사진과 그림으로 남은 기억도 있지만,\n움직이는 장면 속에 그대로 남아 있는 순간들도 있습니다.",
            "다시 보고 싶은 장면들을 만나볼까요?",
          ]}
          title="다시 보고 싶은 순간들"
          href="/videos"
          transitionPhrase="기억 속 장면이 다시 움직이기 시작합니다."
        />
      </main>
    </>
  );
}
