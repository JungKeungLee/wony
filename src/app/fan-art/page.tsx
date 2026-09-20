import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import FanArtHero from "@/components/fan-art/FanArtHero";
import FanArtGallery from "@/components/fan-art/FanArtGallery";

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
        <FanArtGallery />
      </main>
    </>
  );
}
