"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { useSiteMode } from "@/context/SiteModeContext";
import { useCinematicTransition } from "@/context/CinematicTransitionContext";

interface NextChapterProps {
  /** 작은 라벨. 기본값 "NEXT CHAPTER". */
  eyebrow?: string;
  /** 감성 문구. 문단 하나당 배열 항목 하나, 문단 안에서 줄바꿈은 "\n"으로 표시한다. */
  message: string[];
  /** 버튼 안에 들어갈 텍스트(대괄호는 컴포넌트가 붙인다). */
  title: string;
  href: string;
  /** CinematicPageTransition에 표시할 짧은 전환 문구. */
  transitionPhrase: string;
}

/**
 * WONY 정식 사이트의 "챕터" 흐름(HOME → TIMELINE → ... → FAN ART → VIDEO) 하단에
 * 반복해서 쓰는 공통 "다음 이야기" 블록. contribute 모드에서는 이 챕터 흐름 자체가
 * 존재하지 않으므로 아무것도 렌더링하지 않는다(페이지별로 매번 isContributeMode를
 * 체크하지 않아도 되도록 이 컴포넌트가 스스로 판단한다).
 *
 * 클릭하면 즉시 이동하지 않고 useCinematicTransition().navigate()로 짧은 전환
 * 연출을 먼저 보여준 뒤 이동한다 - 상단 Navigation의 자유 이동(항상 즉시 이동)과는
 * 의도적으로 다르게 동작한다.
 */
export default function NextChapter({
  eyebrow = "NEXT CHAPTER",
  message,
  title,
  href,
  transitionPhrase,
}: NextChapterProps) {
  const { isContributeMode } = useSiteMode();
  const { navigate } = useCinematicTransition();

  if (isContributeMode) return null;

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    navigate(href, transitionPhrase);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="mx-auto flex max-w-xl flex-col items-center gap-5 border-t border-white/10 px-6 py-20 text-center sm:py-24"
    >
      <span className="font-display text-[10px] tracking-[0.4em] text-star/70">{eyebrow}</span>

      <div className="flex flex-col gap-2">
        {message.map((paragraph, i) => (
          <p key={i} className="font-serif-kr text-sm leading-relaxed text-text-soft sm:text-base">
            {paragraph.split("\n").map((line, j) => (
              <span key={j}>
                {line}
                {j < paragraph.split("\n").length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}
      </div>

      <Link
        href={href}
        onClick={handleClick}
        className="mt-2 inline-block min-h-11 border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-star hover:text-star"
      >
        [ {title} ]
      </Link>
    </motion.section>
  );
}
