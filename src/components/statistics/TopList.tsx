"use client";

import { motion } from "framer-motion";
import type { TopContentItem } from "@/lib/types";

export default function TopList({
  title,
  items,
  delay = 0,
}: {
  title: string;
  items: TopContentItem[];
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className="flex flex-col gap-4"
    >
      <h3 className="font-display text-xs tracking-[0.3em] text-star">{title}</h3>
      <ol className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.rank}
            className="flex items-center gap-4 border border-white/10 bg-bg-soft/50 px-5 py-4"
          >
            <span className="font-display text-2xl text-pink/80">{item.rank}</span>
            <div className="flex flex-1 flex-col text-left">
              <span className="font-serif-kr text-text">{item.name}</span>
              <span className="text-xs text-text-soft">{item.detail}</span>
            </div>
          </li>
        ))}
      </ol>
    </motion.div>
  );
}
