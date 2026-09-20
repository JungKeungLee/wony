"use client";

import { useState } from "react";
import Image from "next/image";

interface TimelineImageProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function TimelineImage({
  src,
  alt,
  sizes,
  priority,
  className = "",
  onClick,
}: TimelineImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-bg-soft ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-star/50">
          <span className="text-xl">✦</span>
          <span className="text-[10px] tracking-[0.2em] text-text-soft/50">
            IMAGE SOON
          </span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
