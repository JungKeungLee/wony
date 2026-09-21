"use client";

import { motion } from "framer-motion";
import type { ArchiveMonth } from "@/data/archive";
import type { ArchiveComment, ArchiveImage } from "@/lib/types";
import ArchiveCard from "./ArchiveCard";
import HiddenStar from "@/components/effects/HiddenStar";

interface ArchiveMonthSectionProps extends ArchiveMonth {
  /** ARCHIVE 페이지의 고정 다이아 위치(첫 번째 월 제목 옆)가 12번 반복되지 않도록
   * 첫 번째 월 섹션에서만 실제로 렌더링한다. */
  isFirst: boolean;
  images: Map<string, ArchiveImage>;
  uploadingId: string | null;
  comments: Map<string, ArchiveComment>;
  onAddPhoto: (archiveId: string) => void;
  onOpenPhoto: (archiveId: string) => void;
  onSaveComment: (archiveId: string, text: string) => Promise<void>;
  onDeleteComment: (archiveId: string) => Promise<void>;
  onEditEntry: (archiveId: string) => void;
  onDeleteEntry: (archiveId: string) => void;
}

export default function ArchiveMonthSection({
  month,
  monthLabel,
  items,
  isFirst,
  images,
  uploadingId,
  comments,
  onAddPhoto,
  onOpenPhoto,
  onSaveComment,
  onDeleteComment,
  onEditEntry,
  onDeleteEntry,
}: ArchiveMonthSectionProps) {
  return (
    <section
      id={`month-${month}`}
      className="mx-auto max-w-[1000px] scroll-mt-32 px-6 py-10"
    >
      <div className="relative mb-6 flex items-baseline gap-3">
        {isFirst && (
          <HiddenStar id="archive" className="absolute -right-7 -top-2 sm:-right-9" />
        )}
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
              <ArchiveCard
                key={item.id}
                item={item}
                image={images.get(item.id)}
                isUploading={uploadingId === item.id}
                comment={comments.get(item.id)}
                onAddPhoto={() => onAddPhoto(item.id)}
                onOpenPhoto={() => onOpenPhoto(item.id)}
                onSaveComment={(text) => onSaveComment(item.id, text)}
                onDeleteComment={() => onDeleteComment(item.id)}
                onEditEntry={() => onEditEntry(item.id)}
                onDeleteEntry={() => onDeleteEntry(item.id)}
              />
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
