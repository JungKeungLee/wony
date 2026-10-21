"use client";

import IntroGate from "@/components/intro/IntroGate";
import ContributeHome from "@/components/contribute/ContributeHome";
import { useSiteMode } from "@/context/SiteModeContext";

export default function Home() {
  const { isContributeMode } = useSiteMode();

  if (isContributeMode) return <ContributeHome />;
  return <IntroGate />;
}
