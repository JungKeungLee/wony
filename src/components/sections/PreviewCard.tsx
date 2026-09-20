"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PreviewItem } from "@/lib/types";

export default function PreviewCard({
  item,
  delay = 0,
}: {
  item: PreviewItem;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
    >
      <Link
        href={item.href}
        className="group flex flex-col gap-4 border border-white/10 bg-bg-soft/50 p-8 transition-colors hover:border-pink/50 hover:bg-bg-soft"
      >
        <span className="font-display text-sm tracking-[0.2em] text-star">
          {item.index}
        </span>
        <h3 className="font-display text-xl tracking-[0.1em] text-text sm:text-2xl">
          {item.title}
        </h3>
        <p className="font-serif-kr text-sm text-text-soft sm:text-base">
          {item.description}
        </p>
        <span className="mt-2 text-xs tracking-[0.2em] text-text-soft transition-colors group-hover:text-pink">
          VIEW MORE →
        </span>
      </Link>
    </motion.div>
  );
}
