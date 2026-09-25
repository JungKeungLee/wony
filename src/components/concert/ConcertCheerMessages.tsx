"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import { CONCERT_CHEER_MESSAGES } from "@/data/concert";

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

export default function ConcertCheerMessages() {
  return (
    <section className="relative bg-cream px-6 py-20 sm:py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="mx-auto flex max-w-5xl flex-col gap-8"
      >
        <motion.div
          variants={cardVariant}
          className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left"
        >
          <div className="flex flex-col gap-2">
            <h2 className="font-serif-kr text-lg tracking-[0.05em] text-gold-deep">
              워니에게 보내는 응원 💌
            </h2>
            <p className="font-serif-kr text-sm text-ink-soft">
              미니콘서트를 준비하고 있는 워니에게 응원의 메시지를 남겨주세요.
            </p>
          </div>
          {/* 실제 응원 메시지 목록/작성 기능은 추후 연동 예정이라 지금은 비활성 표시만 둔다 */}
          <span className="cursor-default text-xs tracking-[0.15em] text-ink-soft/50">
            더 많은 응원 보기 →
          </span>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CONCERT_CHEER_MESSAGES.map((message) => (
            <motion.div
              key={message.id}
              variants={cardVariant}
              className="flex flex-col gap-3 border border-white bg-white/80 p-6 shadow-[0_10px_26px_rgba(69,50,63,0.1)]"
              style={{ borderTop: "3px solid var(--color-peach)" }}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif-kr text-sm text-ink">{message.nickname}</span>
                <span className="text-[10px] text-ink-soft/70">{message.timeAgo}</span>
              </div>
              <p className="font-serif-kr flex-1 text-sm leading-relaxed text-ink-soft">
                {message.content.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              <span className="text-xs text-gold-deep">♡ {message.likes}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
