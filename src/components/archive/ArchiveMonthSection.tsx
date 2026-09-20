"use client";

import { motion } from "framer-motion";
import type { ArchiveMonth } from "@/data/archive";
import ArchiveCard from "./ArchiveCard";

export default function ArchiveMonthSection({
  month,
  monthLabel,
  items,
}: ArchiveMonth) {
  return (
    <section
      id={`month-${month}`}
      className="mx-auto max-w-3xl scroll-mt-32 px-6 py-10"
    >
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-display text-3xl text-text-soft/30 sm:text-4xl">
          {String(month).padStart(2, "0")}
        </span>
        <span className="font-display text-sm tracking-[0.3em] text-star">
          {monthLabel}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {items.length > 0 ? (
          <div className="flex flex-col">
            {items.map((item) => (
              <ArchiveCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="font-serif-kr border-b border-white/10 py-8 text-center text-text-soft">
            아직 정리된 방송 기록이 없습니다.
          </p>
        )}
      </motion.div>
    </section>
  );
}
