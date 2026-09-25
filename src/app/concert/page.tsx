import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import ConcertHero from "@/components/concert/ConcertHero";
import ConcertInfo from "@/components/concert/ConcertInfo";
import ConcertMessage from "@/components/concert/ConcertMessage";
import ConcertCountdown from "@/components/concert/ConcertCountdown";
import ConcertSetList from "@/components/concert/ConcertSetList";
import ConcertGallery from "@/components/concert/ConcertGallery";
import ConcertCheerMessages from "@/components/concert/ConcertCheerMessages";
import ConcertEnding from "@/components/concert/ConcertEnding";

export const metadata: Metadata = {
  title: "GOOD BYE SUMMER | 난워니 미니콘서트 | WONY",
  description: "2026.09.30, 워니와 함께하는 난워니 미니콘서트 GOOD BYE SUMMER에 초대합니다.",
};

export default function ConcertPage() {
  return (
    <>
      <Navigation />
      <main>
        <ConcertHero />
        <ConcertInfo />
        <ConcertMessage />
        <ConcertCountdown />
        <ConcertSetList />
        <ConcertGallery />
        <ConcertCheerMessages />
        <ConcertEnding />
      </main>
    </>
  );
}
