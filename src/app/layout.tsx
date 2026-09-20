import type { Metadata } from "next";
import { Noto_Sans_KR, Nanum_Myeongjo, Playfair_Display } from "next/font/google";
import { MusicProvider } from "@/context/MusicContext";
import StarField from "@/components/effects/StarField";
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

export const metadata: Metadata = {
  title: "WONY | Our Memories of 2026",
  description: "2026년, 워니와 팬들이 함께한 순간을 돌아보는 연말 팬 프로젝트",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${nanumMyeongjo.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-text">
        <MusicProvider>
          <StarField />
          {children}
        </MusicProvider>
      </body>
    </html>
  );
}
