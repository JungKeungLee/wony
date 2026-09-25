"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { CONTRIBUTE_DEADLINE } from "@/lib/constants";
import Navigation from "@/components/layout/Navigation";

interface ContributeCard {
  label: string;
  title: string;
  description: string;
  href: string;
}

const GUIDE_STEPS = [
  "워니에게 하고 싶은 말을\nLETTER에 편지로 남겨주세요.",
  "2026년 최고의 영상을 골라주세요 ✦\n마음에 드는 영상에는 여러 번 투표할 수 있습니다.",
  "워니를 생각하며 만든 팬아트가 있다면\nFAN ART에 올려주세요.",
];

const CARDS: ContributeCard[] = [
  {
    label: "LETTER",
    title: "워니에게 편지 남기기",
    description: "올해 전하지 못했던 이야기를\n편지로 남겨주세요.",
    href: "/letters",
  },
  {
    label: "FAN ART",
    title: "팬아트 올리기",
    description: "워니를 생각하며 만든\n소중한 팬아트를 남겨주세요.",
    href: "/fan-art",
  },
  {
    label: "VIDEO",
    title: "기억에 남는 영상 남기기",
    description: "2026년 워니 방송 중\n기억에 남았던 순간을 골라주세요.",
    href: "/videos",
  },
];

/**
 * contribute(참여용 사전 공개) 모드에서 "/"에 보여주는 화면. 기존 cinematic
 * HOME(Intro 영상 -> 스마트폰 -> Hero)은 전혀 렌더링하지 않고, LETTER/FAN ART/
 * VIDEO 참여만 안내하는 작은 페이지만 보여준다. TIMELINE/ARCHIVE/STATISTICS/
 * SURPRISE/다이아/카운트다운 등 다른 기능이 존재한다는 힌트는 어디에도 넣지
 * 않는다 - "정식 팬사이트 하나가 이미 완성돼 있다"는 사실을 눈치채지 못하게
 * 하는 것이 이 화면의 목적이다.
 */
export default function ContributeHome() {
  return (
    <>
      <Navigation />
      <main className="flex min-h-svh flex-col items-center px-6 py-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex w-full max-w-md flex-col items-center gap-14 text-center"
        >
          {/* 1. 메인 문구 */}
          <div className="flex flex-col items-center gap-4">
            <motion.p variants={fadeUp} className="font-display text-2xl tracking-[0.2em] text-text">
              WONY
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-serif-kr text-xl leading-relaxed text-text sm:text-2xl"
            >
              2026년의 마지막 페이지를
              <br />
              함께 채워주세요 <span className="text-star">✦</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="font-serif-kr text-sm leading-relaxed text-text-soft sm:text-base">
              올해 워니와 함께했던 기억을
              <br />
              여러분의 이야기로 남겨주세요.
            </motion.p>
          </div>

          {/* 2. 참여 안내 - 부담스럽지 않게, 아주 옅은 톤으로만 */}
          <motion.ol variants={fadeUp} className="flex w-full flex-col gap-4 text-left">
            {GUIDE_STEPS.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-display shrink-0 text-xs text-star/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-serif-kr whitespace-pre-line text-xs leading-relaxed text-text-soft sm:text-sm">
                  {step}
                </p>
              </li>
            ))}
          </motion.ol>

          {/* 7. 비밀 부탁 영역 - 경고가 아니라 다정한 부탁으로, 은은한 금빛 톤만 */}
          <motion.div
            variants={fadeUp}
            className="w-full border border-star/25 bg-bg-soft/60 px-6 py-6 text-left"
          >
            <p className="mb-2 flex items-center gap-2 font-serif-kr text-sm text-star sm:text-base">
              <span aria-hidden>🤫</span>
              작은 부탁이 하나 있어요.
            </p>
            <p className="font-serif-kr text-xs leading-relaxed text-text-soft sm:text-sm">
              이 사이트는 워니에게
              <br />
              서프라이즈로 공개할 예정입니다.
              <br />
              정식 공개 전까지
              <br />
              워니에게는 꼭 비밀로 부탁드립니다. <span className="text-star">✦</span>
            </p>
          </motion.div>

          {/* 5. 참여 카드 3개 */}
          <motion.div variants={fadeUp} className="flex w-full flex-col gap-4">
            {CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col gap-1.5 border border-white/10 bg-bg-soft/40 px-6 py-5 text-left transition-colors hover:border-star/40 hover:bg-bg-soft/70"
              >
                <span className="font-display text-[11px] tracking-[0.3em] text-star">
                  {card.label}
                </span>
                <span className="font-serif-kr text-base text-text sm:text-lg">{card.title}</span>
                <span className="font-serif-kr whitespace-pre-line text-xs leading-relaxed text-text-soft sm:text-sm">
                  {card.description}
                </span>
              </Link>
            ))}
          </motion.div>

          {/* 3~4. 하단 작은 안내 문구 + 참여 기간 */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 pt-2">
            <p className="text-[10px] leading-relaxed text-text-soft/50 sm:text-[11px]">
              여러분이 남겨주신 편지, 팬아트, 영상은
              <br />
              2026년 연말 서프라이즈 페이지 구성에 사용될 수 있습니다.
              <br />
              정식 공개 전까지 사이트 링크와 내용을 외부에 공유하지 말아주세요.
            </p>

            <p className="text-xs tracking-[0.15em] text-star/90 sm:text-sm">
              참여 기간 {CONTRIBUTE_DEADLINE.start} ~ {CONTRIBUTE_DEADLINE.end}
            </p>
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}
