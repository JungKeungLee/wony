"use client";

import { motion } from "framer-motion";
import type { TimelineMonthData, TimelineImageRow } from "@/lib/types";
import { fadeUp } from "@/lib/motion";
import { getSmallImageSlots, getTimelineImageUrl, getVisibleSmallImages } from "@/lib/timelineImages";
import TimelineImage from "./TimelineImage";
import { useSiteMode } from "@/context/SiteModeContext";

interface TimelineMonthProps {
  data: TimelineMonthData;
  align: "left" | "right";
  coverImage: TimelineImageRow | undefined;
  isUploadingCover: boolean;
  onAddCoverPhoto: () => void;
  onDeleteCoverPhoto: () => void;
  smallImages: TimelineImageRow[];
  uploadingSmallSlot: number | null;
  /** 다른 업로드/삭제가 진행 중이면 true - 빈 칸 버튼을 모두 막아 중복 요청을 막는다. */
  isSmallSlotLocked: boolean;
  onAddSmallPhoto: (sortOrder: number) => void;
  onOpenImage: (images: string[], index: number, alt: string) => void;
}

export default function TimelineMonth({
  data,
  align,
  coverImage,
  isUploadingCover,
  onAddCoverPhoto,
  onDeleteCoverPhoto,
  smallImages,
  uploadingSmallSlot,
  isSmallSlotLocked,
  onAddSmallPhoto,
  onOpenImage,
}: TimelineMonthProps) {
  const { isContributeMode } = useSiteMode();
  const { month, monthLabel, date, title, description, quote, images, featured } = data;
  const cover = images[0];
  const isRight = align === "right";

  const resolvedCover = coverImage ? getTimelineImageUrl(coverImage.image_path) : cover;
  // 작은 이미지는 배열 순서가 아니라 DB의 sort_order로 칸을 정한다(1번 칸 = sort_order 1).
  // DB에 남아있을 수 있는 3번째 슬롯(과거 데이터)은 화면/모달에 끼어들지 않는다 - 데이터는
  // 지우지 않는다. 모달 순서와 모달 삭제 대상도 같은 getVisibleSmallImages 기준을 쓴다.
  const smallImageSlots = getSmallImageSlots(smallImages);
  const visibleSmallImages = getVisibleSmallImages(smallImages);
  const smallImageUrls = visibleSmallImages.map((img) => getTimelineImageUrl(img.image_path));
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
                {/* 운영 테스트 전용 구분: 삭제는 관리자 화면에서만 보인다. */}
                {!isContributeMode && (
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
                )}
              </div>
            )}
          </div>

          <h3 className="font-serif-kr text-xl text-text sm:text-2xl">{title}</h3>
          <p className="max-w-md text-sm text-text-soft sm:text-base">{description}</p>
          <p className="font-serif-kr max-w-md text-sm text-pink/90 italic">“{quote}”</p>

          <div className={`grid w-full max-w-md grid-cols-2 gap-3 ${isRight ? "" : "md:justify-items-end"}`}>
            {smallImageSlots.map((image, i) => {
              const sortOrder = i + 1;
              const isUploading = uploadingSmallSlot === sortOrder;

              if (image) {
                // 모달에서는 대표 이미지(0) 다음에 "보이는" 작은 이미지가 칸 순서대로 이어진다.
                const modalIndex = visibleSmallImages.indexOf(image) + 1;
                return (
                  <TimelineImage
                    key={image.id}
                    src={smallImageUrls[modalIndex - 1]}
                    alt={`${title} 작은 이미지 ${sortOrder}`}
                    onClick={() => onOpenImage(displayedImages, modalIndex, title)}
                    className="aspect-video w-full"
                    sizes="45vw"
                  />
                );
              }

              return (
                <button
                  key={`empty-${sortOrder}`}
                  type="button"
                  onClick={() => onAddSmallPhoto(sortOrder)}
                  disabled={isUploading || isSmallSlotLocked}
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
