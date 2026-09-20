import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import VideoForm from "@/components/videos/VideoForm";

export const metadata: Metadata = {
  title: "영상 등록하기 | WONY",
  description: "워니와 함께한 순간이 담긴 영상을 등록해보세요.",
};

export default function VideoWritePage() {
  return (
    <>
      <Navigation />
      <main>
        <section className="flex flex-col items-center gap-4 px-6 pb-10 pt-32 text-center sm:pt-40">
          <span className="font-display text-xs tracking-[0.4em] text-star">
            SUBMIT
          </span>
          <h1 className="font-display text-3xl tracking-wide text-text sm:text-5xl">
            영상 등록하기
          </h1>
        </section>
        <VideoForm />
      </main>
    </>
  );
}
