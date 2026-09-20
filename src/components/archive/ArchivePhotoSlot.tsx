"use client";

import Image from "next/image";
import { getArchiveImageUrl } from "@/lib/archiveImages";
import type { ArchiveImage } from "@/lib/types";

interface ArchivePhotoSlotProps {
  image: ArchiveImage | undefined;
  alt: string;
  isUploading: boolean;
  onAddPhoto: () => void;
  onOpenPhoto: () => void;
}

export default function ArchivePhotoSlot({
  image,
  alt,
  isUploading,
  onAddPhoto,
  onOpenPhoto,
}: ArchivePhotoSlotProps) {
  if (image) {
    return (
      <button
        type="button"
        onClick={onOpenPhoto}
        disabled={isUploading}
        aria-label={alt}
        className="group relative block aspect-video w-full overflow-hidden border border-white/10 bg-bg-soft transition-colors hover:border-pink/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-[200px] md:w-[220px]"
      >
        <Image
          src={getArchiveImageUrl(image.image_path)}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 220px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {isUploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[11px] tracking-[0.15em] text-text">
            변경하는 중...
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex sm:w-[200px] sm:justify-end md:w-[220px]">
      <button
        type="button"
        onClick={onAddPhoto}
        disabled={isUploading}
        className="text-xs tracking-[0.1em] text-text-soft/70 underline underline-offset-4 transition-colors hover:text-pink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? "등록하는 중..." : "[ 사진 추가 ]"}
      </button>
    </div>
  );
}
