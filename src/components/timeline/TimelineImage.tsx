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

/**
 * 호출하는 쪽에서 반드시 `key={src}`로 렌더링해야 한다. hasError는 로드 실패를
 * 기억하는 로컬 state라서, src가 나중에 바뀌어도(예: 정적 placeholder 경로 ->
 * Supabase에 등록된 실제 이미지) key가 그대로면 이전 실패 상태를 계속 들고 있어
 * 새 src를 다시 시도하지 않는다. key를 바꿔 컴포넌트를 새로 마운트시켜야
 * hasError가 깨끗하게 초기화된다.
 */
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
