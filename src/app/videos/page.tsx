import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import VideosHero from "@/components/videos/VideosHero";
import VideoGrid from "@/components/videos/VideoGrid";

export const metadata: Metadata = {
  title: "Video | WONY",
  description: "2026년 우리의 순간을 영상으로",
};

export default function VideosPage() {
  return (
    <>
      <Navigation />
      <main>
        <VideosHero />
        <VideoGrid />
      </main>
    </>
  );
}
