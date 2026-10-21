import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Noto_Sans_KR, Nanum_Myeongjo, Playfair_Display } from "next/font/google";
import { MusicProvider } from "@/context/MusicContext";
import { StarCollectionProvider } from "@/context/StarCollectionContext";
import { SiteModeProvider } from "@/context/SiteModeContext";
import { CinematicTransitionProvider } from "@/context/CinematicTransitionContext";
import { getBaseSiteMode, isSiteMode, SITE_MODES, type SiteMode } from "@/lib/siteMode";
import StarField from "@/components/effects/StarField";
import StarProgressBadge from "@/components/effects/StarProgressBadge";
import StarUnlockCelebration from "@/components/effects/StarUnlockCelebration";
import YearEndCountdown from "@/components/effects/YearEndCountdown";
import Footer from "@/components/layout/Footer";
import "../globals.css";

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
 * 모든 페이지를 contribute / public 두 버전으로 빌드 때 정적 생성한다(요청마다 서버
 * 렌더링하지 않음 - Cloudflare Workers 무료 플랜 CPU 한도 대응).
 *
 * 어떤 버전을 보여줄지는 proxy.ts가 서버에서 결정한다: 기본 모드(NEXT_PUBLIC_SITE_MODE)와
 * HMAC 서명 쿠키 검증 결과에 따라 /letters -> /contribute/letters 또는 /public/letters로
 * 내부 rewrite한다. 그래서 이 레이아웃은 쿠키를 읽지 않고 URL의 mode 값만 믿는다 -
 * /public/* 버전은 proxy가 서명을 확인한 요청(또는 기본 모드가 public인 경우)에만 열린다.
 */
export function generateStaticParams(): { mode: SiteMode }[] {
  return SITE_MODES.map((mode) => ({ mode }));
}

async function resolveMode(params: Promise<{ mode: string }>): Promise<SiteMode> {
  const { mode } = await params;
  if (!isSiteMode(mode)) notFound();
  return mode;
}

/** 검색엔진/링크 미리보기는 proxy가 기본 모드 버전으로 보내므로 기본 모드 기준 문구가 노출된다. */
export async function generateMetadata({ params }: LayoutProps<"/[mode]">): Promise<Metadata> {
  return (await resolveMode(params)) === "contribute"
    ? {
        title: "WONY 2026",
        description: "2026년의 마지막 페이지를 함께 채워주세요.",
      }
    : {
        title: "WONY | Our Memories of 2026",
        description: "2026년, 워니와 팬들이 함께한 순간을 돌아보는 연말 팬 프로젝트",
      };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[mode]">) {
  const effectiveMode = await resolveMode(params);
  // 기본 모드가 contribute인데 public 버전이 열렸다면 proxy가 서명 쿠키를 확인한 Full Preview다.
  const isPreview = effectiveMode === "public" && getBaseSiteMode() === "contribute";

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
