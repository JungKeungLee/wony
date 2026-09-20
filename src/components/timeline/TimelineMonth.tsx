"use client";

import { motion } from "framer-motion";
import type { TimelineMonthData } from "@/lib/types";
import { fadeUp } from "@/lib/motion";
import TimelineImage from "./TimelineImage";

interface TimelineMonthProps {
  data: TimelineMonthData;
  align: "left" | "right";
  onOpenImage: (images: string[], index: number, alt: string) => void;
}

export default function TimelineMonth({ data, align, onOpenImage }: TimelineMonthProps) {
  const { month, monthLabel, date, title, description, quote, images, featured } = data;
  const [cover, ...rest] = images;
  const isRight = align === "right";

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15% 0px" }}
      className="relative"
    >
      <span
        aria-hidden
        className={`absolute left-1/2 top-3 hidden h-3 w-3 -translate-x-1/2 rounded-full md:block ${
          featured ? "bg-pink shadow-[0_0_16px_rgba(255,217,226,0.7)]" : "bg-star shadow-[0_0_10px_rgba(255,230,167,0.5)]"
        }`}
      />

      <div className="grid gap-6 md:grid-cols-2 md:gap-x-20">
        <div
          className={`flex flex-col gap-5 ${
            isRight ? "md:col-start-2 md:text-left md:items-start" : "md:text-right md:items-end"
          }`}
        >
          {featured && (
            <span className="font-display text-[11px] tracking-[0.3em] text-pink">
              ✦ FEATURED MONTH
            </span>
          )}

          <div className={`flex items-baseline gap-3 ${isRight ? "" : "md:flex-row-reverse"}`}>
            <span
              className={`font-display text-4xl sm:text-5xl ${
                featured ? "text-pink/70" : "text-text-soft/30"
              }`}
            >
              {String(month).padStart(2, "0")}
            </span>
            <div className={`flex flex-col ${isRight ? "" : "md:items-end"}`}>
              <span className="font-display text-sm tracking-[0.3em] text-star">
                {monthLabel}
              </span>
              <span className="text-xs text-text-soft">{date}</span>
            </div>
          </div>

          <TimelineImage
            src={cover}
            alt={`${title} 대표 이미지`}
            onClick={() => onOpenImage(images, 0, title)}
            className={`aspect-[4/3] w-full max-w-md ${featured ? "ring-1 ring-pink/40" : ""}`}
            sizes="(min-width: 768px) 45vw, 90vw"
          />

          <h3 className="font-serif-kr text-xl text-text sm:text-2xl">{title}</h3>
          <p className="max-w-md text-sm text-text-soft sm:text-base">{description}</p>
          <p className="font-serif-kr max-w-md text-sm text-pink/90 italic">“{quote}”</p>

          {rest.length > 0 && (
            <div className={`grid w-full max-w-md grid-cols-3 gap-2 ${isRight ? "" : "md:justify-items-end"}`}>
              {rest.map((src, i) => (
                <TimelineImage
                  key={src}
                  src={src}
                  alt={`${title} 추가 이미지 ${i + 1}`}
                  onClick={() => onOpenImage(images, i + 1, title)}
                  className="aspect-square w-full"
                  sizes="30vw"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
