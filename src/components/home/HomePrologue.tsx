"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSiteMode } from "@/context/SiteModeContext";
import { useCinematicTransition } from "@/context/CinematicTransitionContext";
import ChapterNote from "@/components/narrative/ChapterNote";

const HOME_TO_TIMELINE_HREF = "/timeline";
/** 정식 사이트의 다른 챕터 전환과 동일한 문구를 그대로 재사용한다. */
const HOME_TO_TIMELINE_TRANSITION_PHRASE = "그 해의 시간을 다시 걸어봅니다.";

/**
 * HOME의 프롤로그 구간. Hero 다음부터 TIMELINE으로 넘어가기 직전까지, 메뉴를
 * 고르는 화면이 아니라 "2026년 이야기가 이제 막 시작되는 도입부"로 읽히도록
 * 텍스트와 작은 인터랙션 위주로만 구성한다. ARCHIVE 랜덤 추억, LETTER/FAN ART
 * 미리보기, VIDEO/STATISTICS 콘텐츠, CONCERT 등 다른 메뉴의 내용은 절대
 * 가져오지 않는다 - 각 페이지에서 처음 발견하는 재미를 그대로 남겨두기 위함.
 *
 * HomeExperience는 애초에 public 모드에서만 렌더링되지만(app/page.tsx가
 * contribute면 ContributeHome으로 분기), 이 챕터 흐름 계열의 다른 컴포넌트
 * (NextChapter, ChapterNote)와 동일하게 스스로도 한 번 더 isContributeMode를
 * 확인한다.
 */
export default function HomePrologue() {
  const { isContributeMode } = useSiteMode();
  const { navigate } = useCinematicTransition();
  const prefersReducedMotion = useReducedMotion();

  if (isContributeMode) return null;

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    navigate(HOME_TO_TIMELINE_HREF, HOME_TO_TIMELINE_TRANSITION_PHRASE);
  }

  const paragraphTransition = (delay: number) =>
    prefersReducedMotion
      ? { duration: 0.4, delay: 0 }
      : { duration: 0.9, delay, ease: "easeOut" as const };

  return (
    <>
      <ChapterNote
        lines={["한 해가 끝나기 전에,", "우리가 함께했던 순간들을 다시 꺼내봅니다."]}
      />

      {/* 평범했던 하루도 / 함께했기에 기억이 되었습니다 - 과한 typing 효과 없이
          opacity + translateY만으로, 한 줄씩 살짝 늦춰 나타난다. */}
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={paragraphTransition(0)}
          className="font-serif-kr text-sm italic leading-relaxed text-text-soft/80 sm:text-base"
        >
          평범했던 하루도,
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={paragraphTransition(prefersReducedMotion ? 0 : 0.3)}
          className="font-serif-kr text-sm italic leading-relaxed text-text-soft/80 sm:text-base"
        >
          함께했기에
          <br />
          기억이 되었습니다.
        </motion.p>
      </div>

      <ChapterNote lines={["당신은 2026년의", "어떤 순간을 가장 기억하고 있나요?"]} />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={prefersReducedMotion ? { duration: 0.4 } : { duration: 0.9, ease: "easeOut" }}
        className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 pb-24 pt-4 text-center sm:pb-28"
      >
        <span aria-hidden className="text-sm text-star">
          ✦
        </span>

        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-[11px] tracking-[0.4em] text-star">CHAPTER 01</span>
          <span className="font-display text-2xl tracking-[0.15em] text-text sm:text-3xl">
            OUR 2026
          </span>
        </div>

        <p className="font-serif-kr text-base text-text-soft sm:text-lg">
          그럼,
          <br />
          우리의 2026년을 다시 걸어볼까요?
        </p>

        <Link
          href={HOME_TO_TIMELINE_HREF}
          onClick={handleClick}
          className="mt-1 inline-block min-h-11 border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-star hover:text-star"
        >
          [ 2026년의 이야기 시작하기 ✦ ]
        </Link>
      </motion.section>
    </>
  );
}
