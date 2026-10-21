import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import AwardsExperience from "@/components/awards/AwardsExperience";

export const metadata: Metadata = {
  title: "WONY AWARDS 2026 | WONY",
  description: "2026년 가장 빛났던 순간들을 시상식처럼 되짚어봅니다.",
};

/**
 * WONY AWARDS 2026 프로토타입(확정 기능 아님). "/awards"는 일부러 Navigation
 * 메뉴(NAV_ITEMS)와 contribute 모드 allowlist(CONTRIBUTE_ALLOWED_PATHS)
 * 어디에도 추가하지 않았다 - STATISTICS/TIMELINE/ARCHIVE 등 기존 페이지와
 * 동일한 방식으로, contribute(고객) 모드에서는 proxy.ts가 이 경로를 자동으로
 * "/"로 돌려보내고, 관리자/Full Preview 상태에서만 정상적으로 열린다.
 */
export default function AwardsPage() {
  return (
    <>
      <Navigation />
      <AwardsExperience />
    </>
  );
}
