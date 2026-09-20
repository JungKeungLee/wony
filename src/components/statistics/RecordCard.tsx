"use client";

import { motion } from "framer-motion";
import type { RecordStat } from "@/lib/types";

export default function RecordCard({
  title,
  value,
  description,
  delay = 0,
}: RecordStat & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className="flex flex-col gap-2 border border-white/10 bg-bg-soft/50 px-6 py-6 text-center"
    >
      <p className="text-xs tracking-[0.2em] text-text-soft">{title}</p>
      <p className="font-serif-kr text-xl text-text sm:text-2xl">{value}</p>
      {description && (
        <p className="text-xs text-text-soft/80 sm:text-sm">{description}</p>
      )}
    </motion.div>
  );
}
