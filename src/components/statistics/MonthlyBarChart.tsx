"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MonthlyStat } from "@/lib/types";
import HiddenStar from "@/components/effects/HiddenStar";

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

type Mode = "broadcasts" | "hours";

export default function MonthlyBarChart({ data }: { data: MonthlyStat[] }) {
  const [mode, setMode] = useState<Mode>("broadcasts");
  const max = Math.max(...data.map((d) => d[mode]), 1);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-center gap-4 text-xs tracking-[0.15em]">
        <button
          type="button"
          onClick={() => setMode("broadcasts")}
          className={`transition-colors ${
            mode === "broadcasts" ? "text-pink" : "text-text-soft hover:text-text"
          }`}
        >
          방송 횟수
        </button>
        <span aria-hidden className="text-text-soft/30">
          /
        </span>
        <button
          type="button"
          onClick={() => setMode("hours")}
          className={`transition-colors ${
            mode === "hours" ? "text-pink" : "text-text-soft hover:text-text"
          }`}
        >
          방송 시간
        </button>
      </div>

      <div className="relative flex items-end justify-between gap-1.5 sm:gap-3">
        <HiddenStar
          id="statistics"
          variant="statistics-chart"
          className="absolute -right-2 -top-8 sm:-right-3"
        />
        {data.map((d, i) => {
          const value = d[mode];
          const heightPct = Math.max((value / max) * 100, 4);
          return (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] text-text-soft sm:text-xs">
                {value}
                {mode === "hours" ? "h" : ""}
              </span>
              <div className="flex h-28 w-full items-end sm:h-40">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${heightPct}%` }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.04 }}
                  className="w-full bg-gradient-to-t from-star/40 to-pink/70"
                />
              </div>
              <span className="text-[9px] tracking-[0.1em] text-text-soft sm:text-[10px]">
                {MONTH_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
