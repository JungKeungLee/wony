import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Noto_Sans_KR, Nanum_Myeongjo, Playfair_Display } from "next/font/google";
import { MusicProvider } from "@/context/MusicContext";
import { StarCollectionProvider } from "@/context/StarCollectionContext";
import { SiteModeProvider } from "@/context/SiteModeContext";
import { CinematicTransitionProvider } from "@/context/CinematicTransitionContext";
import { getBaseSiteMode, PREVIEW_COOKIE_NAME } from "@/lib/siteMode";
import { verifyPreviewCookieValue } from "@/lib/previewAuth";
import StarField from "@/components/effects/StarField";
import StarProgressBadge from "@/components/effects/StarProgressBadge";
import StarUnlockCelebration from "@/components/effects/StarUnlockCelebration";
import YearEndCountdown from "@/components/effects/YearEndCountdown";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const nanumMyeongjo = Nanum_Myeongjo({
  variable: "--font-nanum-myeongjo",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

/**
 * metadata는 빌드/서버 시점에 고정되는 값이라 방문자별 Full Preview 여부는 반영할
 * 수 없다 - 대신 배포 환경변수 기준의 "기본" 모드로 결정한다(검색엔진/링크
 * 미리보기가 실제로 보는 것도 이 기본 모드 기준이라 정확하다).
 */
export const metadata: Metadata =
  getBaseSiteMode() === "contribute"
    ? {
        title: "WONY 2026",
        description: "2026년의 마지막 페이지를 함께 채워주세요.",
      }
    : {
        title: "WONY | Our Memories of 2026",
        description: "2026년, 워니와 팬들이 함께한 순간을 돌아보는 연말 팬 프로젝트",
      };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const baseMode = getBaseSiteMode();
  const cookieStore = await cookies();
  // proxy.ts와 같은 기준(lib/previewAuth.ts의 HMAC 서명 검증)으로만 판단한다.
  const isPreview = await verifyPreviewCookieValue(cookieStore.get(PREVIEW_COOKIE_NAME)?.value);
  // Full Preview 쿠키가 있으면 이 요청 동안은 public 모드와 동일하게 취급한다.
  const effectiveMode = isPreview ? "public" : baseMode;

  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${nanumMyeongjo.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-text">
        <SiteModeProvider effectiveMode={effectiveMode} isPreview={isPreview}>
          <CinematicTransitionProvider>
            <MusicProvider>
              <StarCollectionProvider>
                <StarField />
                {children}
                <Footer />
                <StarProgressBadge />
                <StarUnlockCelebration />
                <YearEndCountdown />
              </StarCollectionProvider>
            </MusicProvider>
          </CinematicTransitionProvider>
        </SiteModeProvider>
      </body>
    </html>
  );
}
