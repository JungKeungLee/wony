"use client";

import { motion } from "framer-motion";
import type { TimelineMonthData, TimelineImageRow } from "@/lib/types";
import { fadeUp } from "@/lib/motion";
import { getTimelineImageUrl } from "@/lib/timelineImages";
import TimelineImage from "./TimelineImage";
import HiddenStar from "@/components/effects/HiddenStar";

const SMALL_IMAGE_SLOTS = 3;

interface TimelineMonthProps {
  data: TimelineMonthData;
  /** 페이지당 하나만 있어야 하는 timeline-month-number/timeline-gallery 후보 슬롯을
   * 12번 반복해서 그리지 않도록, 첫 번째 달에서만 실제로 렌더링한다. */
  isFirst: boolean;
  align: "left" | "right";
  coverImage: TimelineImageRow | undefined;
  isUploadingCover: boolean;
  onAddCoverPhoto: () => void;
  onDeleteCoverPhoto: () => void;
  smallImages: TimelineImageRow[];
  uploadingSmallSlot: number | null;
  onAddSmallPhoto: (sortOrder: number) => void;
  onOpenImage: (images: string[], index: number, alt: string) => void;
}

export default function TimelineMonth({
  data,
  isFirst,
  align,
  coverImage,
  isUploadingCover,
  onAddCoverPhoto,
  onDeleteCoverPhoto,
  smallImages,
  uploadingSmallSlot,
  onAddSmallPhoto,
  onOpenImage,
}: TimelineMonthProps) {
  const { month, monthLabel, date, title, description, quote, images, featured } = data;
  const cover = images[0];
  const isRight = align === "right";

  const resolvedCover = coverImage ? getTimelineImageUrl(coverImage.image_path) : cover;
  const smallImageUrls = smallImages.map((img) => getTimelineImageUrl(img.image_path));
  const displayedImages = [resolvedCover, ...smallImageUrls];

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

          <div
            className={`relative flex items-baseline gap-3 ${isRight ? "" : "md:flex-row-reverse"}`}
          >
            {isFirst && (
              <HiddenStar
                id="timeline"
                variant="timeline-month-number"
                className="absolute -right-7 -top-3 sm:-right-9"
              />
            )}
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

          <div
            className={`relative aspect-[4/3] w-full max-w-md ${featured ? "ring-1 ring-pink/40" : ""}`}
          >
            <TimelineImage
              key={resolvedCover}
              src={resolvedCover}
              alt={`${title} 대표 이미지`}
              onClick={() => onOpenImage(displayedImages, 0, title)}
              className="h-full w-full"
              sizes="(min-width: 768px) 45vw, 90vw"
            />
            {!coverImage ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddCoverPhoto();
                }}
                disabled={isUploadingCover}
                className="absolute bottom-3 right-3 border border-white/20 bg-bg/70 px-3 py-1.5 text-[11px] tracking-[0.1em] text-text-soft backdrop-blur-sm transition-colors hover:border-star hover:text-star disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploadingCover ? "등록하는 중..." : "[ 사진 추가 ]"}
              </button>
            ) : (
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddCoverPhoto();
                  }}
                  disabled={isUploadingCover}
                  className="border border-white/20 bg-bg/70 px-3 py-1.5 text-[11px] tracking-[0.1em] text-text-soft backdrop-blur-sm transition-colors hover:border-star hover:text-star disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploadingCover ? "변경하는 중..." : "[ 이미지 변경 ]"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCoverPhoto();
                  }}
                  disabled={isUploadingCover}
                  className="border border-pink/30 bg-bg/70 px-3 py-1.5 text-[11px] tracking-[0.1em] text-pink/80 backdrop-blur-sm transition-colors hover:border-pink hover:text-pink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  [ 이미지 삭제 ]
                </button>
              </div>
            )}
          </div>

          <h3 className="font-serif-kr text-xl text-text sm:text-2xl">{title}</h3>
          <p className="max-w-md text-sm text-text-soft sm:text-base">{description}</p>
          <p className="font-serif-kr max-w-md text-sm text-pink/90 italic">“{quote}”</p>

          <div
            className={`relative grid w-full max-w-md grid-cols-3 gap-2 ${
              isRight ? "" : "md:justify-items-end"
            }`}
          >
            {isFirst && (
              <HiddenStar
                id="timeline"
                variant="timeline-gallery"
                className="absolute -bottom-7 right-0"
              />
            )}
            {Array.from({ length: SMALL_IMAGE_SLOTS }, (_, i) => {
              const sortOrder = i + 1;
              const image = smallImages[i];
              const isUploading = uploadingSmallSlot === sortOrder;

              if (image) {
                return (
                  <TimelineImage
                    key={image.id}
                    src={smallImageUrls[i]}
                    alt={`${title} 작은 이미지 ${sortOrder}`}
                    onClick={() => onOpenImage(displayedImages, i + 1, title)}
                    className="aspect-video w-full"
                    sizes="30vw"
                  />
                );
              }

              return (
                <button
                  key={`empty-${sortOrder}`}
                  type="button"
                  onClick={() => onAddSmallPhoto(sortOrder)}
                  disabled={isUploading}
                  className="flex aspect-video w-full items-center justify-center bg-bg-soft text-[10px] tracking-[0.1em] text-text-soft/50 transition-colors hover:text-star disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? "등록 중..." : "[ + 사진 추가 ]"}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
