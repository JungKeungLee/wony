import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import FanArtForm from "@/components/fan-art/FanArtForm";

export const metadata: Metadata = {
  title: "팬아트 보내기 | WONY",
  description: "워니를 향한 마음을 팬아트로 남겨보세요.",
};

export default function FanArtWritePage() {
  return (
    <>
      <Navigation />
      <main>
        <section className="flex flex-col items-center gap-4 px-6 pb-10 pt-32 text-center sm:pt-40">
          <span className="font-display text-xs tracking-[0.4em] text-star">
            SUBMIT
          </span>
          <h1 className="font-display text-3xl tracking-wide text-text sm:text-5xl">
            팬아트 보내기
          </h1>
        </section>
        <FanArtForm />
      </main>
    </>
  );
}
