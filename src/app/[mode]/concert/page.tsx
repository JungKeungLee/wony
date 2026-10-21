import type { Metadata } from "next";
import { notFound } from "next/navigation";
// import Navigation from "@/components/layout/Navigation";
// import ConcertHero from "@/components/concert/ConcertHero";
// import ConcertInfo from "@/components/concert/ConcertInfo";
// import ConcertMessage from "@/components/concert/ConcertMessage";
// import ConcertCountdown from "@/components/concert/ConcertCountdown";
// import ConcertSetList from "@/components/concert/ConcertSetList";
// import ConcertGallery from "@/components/concert/ConcertGallery";
// import ConcertCheerMessages from "@/components/concert/ConcertCheerMessages";
// import ConcertEnding from "@/components/concert/ConcertEnding";

export const metadata: Metadata = {
  title: "GOOD BYE SUMMER | 난워니 미니콘서트 | WONY",
  description: "2026.09.30, 워니와 함께하는 난워니 미니콘서트 GOOD BYE SUMMER에 초대합니다.",
};

/**
 * CONCERT 페이지 임시 비활성화 요청으로, 실제 렌더는 전부 주석 처리하고
 * notFound()로 접근만 막아뒀다. 컴포넌트/데이터 코드는 그대로 남아있으니
 * 다시 열 때는 아래 주석을 풀고 notFound() 호출만 지우면 된다. Navigation의
 * CONTRIBUTE_VISIBLE_LABELS, constants.ts의 NAV_ITEMS, siteMode.ts의
 * CONTRIBUTE_ALLOWED_PATHS도 같이 되돌려야 메뉴/allowlist가 복원된다.
 */
export default function ConcertPage() {
  notFound();

  /*
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
  */
}
