"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { CONTACT_EMAIL, FOOTER_LEGAL_LINKS, FOOTER_SOCIAL_LINKS } from "@/lib/constants";
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

export default function Footer() {
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

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-10 px-6 py-16 text-center sm:py-20">
        <div className="flex flex-col items-center gap-2">
          <p className="font-display text-2xl tracking-[0.15em] text-text">WONY</p>
          <p className="font-display text-xs tracking-[0.35em] text-text-soft">
            OUR MEMORIES OF 2026
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs tracking-[0.2em]">
          {FOOTER_SOCIAL_LINKS.map((link) => (
            <FooterLinkItem key={link.label} link={link} />
          ))}
        </div>

        <div className="flex max-w-xl flex-col gap-2 text-xs leading-relaxed text-text-soft/70">
          <p>
            본 사이트는 팬들이 만든 비영리 팬 프로젝트이며, WONY의 공식
            웹사이트가 아닙니다.
          </p>
          <p>
            사이트에 사용된 이미지, 영상 및 기타 콘텐츠의 권리는 각 원저작자
            및 권리자에게 있습니다.
          </p>
        </div>

        <div className="flex flex-col items-center gap-1 text-xs text-text-soft">
          <span className="tracking-[0.15em]">콘텐츠 삭제 또는 수정 요청</span>
          <FooterLinkItem link={{ label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }} />
        </div>

        <div className="font-serif-kr flex flex-col items-center gap-1 text-sm text-pink/90">
          <p>Made with ♥ for WONY</p>
          <p>See you in 2027 ✦</p>
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] tracking-[0.1em] text-text-soft/60">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <FooterLinkItem key={link.label} link={link} />
            ))}
          </div>
          <p className="text-[11px] tracking-[0.1em] text-text-soft/50">
            © 2026 WONY FAN PROJECT
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
