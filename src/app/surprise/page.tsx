import type { Metadata } from "next";
import SurpriseGate from "@/components/surprise/SurpriseGate";

export const metadata: Metadata = {
  title: "Surprise | WONY",
  description: "2026년 WONY 팬사이트의 마지막 페이지",
  robots: { index: false, follow: false },
};

export default function SurprisePage() {
  return <SurpriseGate />;
}
