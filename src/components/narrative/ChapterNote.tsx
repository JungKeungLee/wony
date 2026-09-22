"use client";

import { motion } from "framer-motion";
import { useSiteMode } from "@/context/SiteModeContext";

interface ChapterNoteProps {
  /** 한 줄씩 배열로 전달한다(문단 안 줄바꿈 표현용). */
  lines: string[];
  className?: string;
}

/**
 * 정식 사이트의 각 챕터 중간/시작/끝에 짧게 끼워 넣는 감성 한두 줄. contribute
 * 모드에서는 이 챕터 연출 자체가 없으므로 아무것도 렌더링하지 않는다 - 사용하는
 * 쪽(TimelineTrack, ArchiveContent 등)이 매번 isContributeMode를 체크할 필요 없이
 * 그냥 항상 렌더링해두면 된다.
 */
export default function ChapterNote({ lines, className = "" }: ChapterNoteProps) {
  const { isContributeMode } = useSiteMode();

  if (isContributeMode) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`font-serif-kr mx-auto max-w-md px-6 py-12 text-center text-sm italic leading-relaxed text-text-soft/80 sm:text-base ${className}`}
    >
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </motion.p>
  );
}
