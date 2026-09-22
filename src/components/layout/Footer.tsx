"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { CONTACT_EMAIL, FOOTER_LEGAL_LINKS, FOOTER_SOCIAL_LINKS } from "@/lib/constants";
import { useStarCollection } from "@/context/StarCollectionContext";
import { useSiteMode } from "@/context/SiteModeContext";
import type { FooterLink } from "@/lib/types";

function FooterLinkItem({ link }: { link: FooterLink }) {
  if (!link.href) {
    return (
      <span className="inline-block cursor-default px-1 py-1 text-text-soft/40">
        {link.label}
      </span>
    );
  }

  if (link.href.startsWith("http") || link.href.startsWith("mailto:")) {
    return (
      <a
        href={link.href}
        target={link.href.startsWith("http") ? "_blank" : undefined}
        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="inline-block px-1 py-1 text-text-soft transition-colors hover:text-pink"
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className="inline-block px-1 py-1 text-text-soft transition-colors hover:text-pink"
    >
      {link.label}
    </Link>
  );
}

/** contribute 모드 전용 최소 Footer. TIMELINE/ARCHIVE/STATISTICS/SURPRISE/다이아 등
 * 정식 공개 전 숨겨야 하는 어떤 정보도 포함하지 않는다 - isUnlocked(다이아 7개
 * 수집 여부)는 과거에 이미 모아둔 방문자가 있을 수 있어 아예 참조하지 않는다. */
function ContributeFooter() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className="relative overflow-hidden bg-bg"
    >
      <div className="relative border-t border-white/10">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-bg px-3 text-sm text-star"
        >
          ✦
        </span>
      </div>

      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-2 px-6 py-10 text-center">
        <p className="font-display text-lg tracking-[0.15em] text-text">WONY 2026</p>
        <p className="font-serif-kr text-xs leading-relaxed text-text-soft/70">
          2026년의 마지막 페이지를
          <br />
          함께 채우고 있습니다. ✦
        </p>
      </div>
    </motion.footer>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const { isUnlocked } = useStarCollection();
  const { isContributeMode } = useSiteMode();
  const showFinalPageLink = isUnlocked && pathname !== "/surprise";

  if (isContributeMode) return <ContributeFooter />;

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className="relative overflow-hidden bg-bg"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/25" />

      <div className="relative border-t border-white/10">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-bg px-3 text-sm text-star"
        >
          ✦
        </span>
      </div>

      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-2 px-6 py-5 text-center">
        {/* 1~2. 브랜드 */}
        <div className="flex flex-col items-center gap-1">
          <p className="font-display text-xl tracking-[0.15em] text-text">WONY</p>
          <p className="font-display text-[11px] tracking-[0.3em] text-text-soft">
            OUR MEMORIES OF 2026
          </p>
        </div>

        {/* 3. 관련 링크 */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs tracking-[0.2em]">
          {FOOTER_SOCIAL_LINKS.map((link) => (
            <FooterLinkItem key={link.label} link={link} />
          ))}
        </div>

        {/* 4. divider */}
        <span aria-hidden className="h-px w-10 bg-white/10" />

        {/* 5. 안내 문구 */}
        <div className="flex flex-col gap-1 text-[11px] leading-snug text-text-soft/70">
          <p>
            본 사이트는 팬들이 만든 비영리 팬 프로젝트이며, WONY의 공식
            웹사이트가 아닙니다.
          </p>
          <p>
            사이트에 사용된 이미지, 영상 및 기타 콘텐츠의 권리는 각 원저작자
            및 권리자에게 있습니다.
          </p>
        </div>

        {/* 6. 문의 이메일 */}
        <div className="flex flex-col items-center gap-1 text-xs text-text-soft">
          <span className="tracking-[0.15em]">콘텐츠 삭제 또는 수정 요청</span>
          <FooterLinkItem link={{ label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }} />
        </div>

        {/* 7. 약관 링크 */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[10px] tracking-[0.1em] text-text-soft/60">
          {FOOTER_LEGAL_LINKS.map((link) => (
            <FooterLinkItem key={link.label} link={link} />
          ))}
        </div>

        {/* 8~9. 감성 문구 */}
        <div className="font-serif-kr flex flex-col items-center gap-0.5 text-sm text-pink/90">
          <p>Made with ♥ for WONY</p>
          <p>See you in 2027 ✦</p>
        </div>

        {/* 10. Copyright */}
        <p className="text-[10px] tracking-[0.1em] text-text-soft/50">
          © 2026 WONY FAN PROJECT
        </p>

        {/* 별 7개를 모두 모은 방문자에게만 보이는 숨겨진 마지막 페이지 입구. */}
        {showFinalPageLink && (
          <Link
            href="/surprise"
            className="mt-2 border border-star/30 px-5 py-2 text-[11px] tracking-[0.2em] text-star/80 transition-colors hover:border-star hover:text-star"
          >
            [ THE FINAL PAGE ]
          </Link>
        )}
      </div>
    </motion.footer>
  );
}
