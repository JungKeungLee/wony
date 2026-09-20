"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getPlatformBadge,
  getVideoEmbedUrl,
  getVideoThumbnail,
  getVideoWatchUrl,
  getWatchButtonLabel,
} from "@/lib/videoPlatform";
import { getCategoryLabel } from "@/lib/videoCategory";
import { deleteVideo } from "@/lib/videos";
import type { VideoItem } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useMusic } from "@/context/MusicContext";

interface VideoModalProps {
  videos: VideoItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDeleted: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function VideoFrame({ video }: { video: VideoItem }) {
  const embedUrl = getVideoEmbedUrl(video.platform, video.video_id);
  const [hasThumbError, setHasThumbError] = useState(false);

  if (embedUrl) {
    return (
      <iframe
        key={embedUrl}
        src={embedUrl}
        className="h-full w-full"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }

  const thumbnail = getVideoThumbnail(video.platform, video.video_id);
  const watchUrl = getVideoWatchUrl(video.platform, video.video_id);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-black/40 p-6 text-center">
      {thumbnail && !hasThumbError ? (
        // eslint-disable-next-line @next/next/no-img-element -- 외부 플랫폼 썸네일이라 next/image 대상이 아님
        <img
          src={thumbnail}
          alt={video.title}
          onError={() => setHasThumbError(true)}
          className="max-h-40 max-w-full object-contain opacity-80"
        />
      ) : (
        <span className="text-3xl text-star/50">▶</span>
      )}
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-text-soft/40 px-6 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink"
      >
        {getWatchButtonLabel(video.platform)}
      </a>
    </div>
  );
}

export default function VideoModal({ videos, index, onClose, onNavigate, onDeleted }: VideoModalProps) {
  const video = index !== null ? videos[index] : null;
  const isOpen = video !== null;

  const { pauseForOverlay, resumeForOverlay } = useMusic();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // 영상 재생 중에는 BGM을 잠시 멈추고, Modal을 닫으면 (사용자가 그 사이 직접 MUSIC OFF를
  // 누르지 않은 이상) 원래대로 되돌린다. prev/next로 다른 영상으로 넘어갈 때는 계속 열려
  // 있는 상태라 다시 실행되지 않는다.
  useEffect(() => {
    if (!isOpen) return;
    pauseForOverlay();
    return () => {
      resumeForOverlay();
    };
  }, [isOpen, pauseForOverlay, resumeForOverlay]);

  function closeModal() {
    setConfirmOpen(false);
    setDeleteError("");
    onClose();
  }

  function navigate(nextIndex: number) {
    setConfirmOpen(false);
    setDeleteError("");
    onNavigate(nextIndex);
  }

  async function handleConfirmDelete() {
    if (!video) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteVideo(video.id);
      setConfirmOpen(false);
      setIsDeleting(false);
      onDeleted(video.id);
    } catch {
      setConfirmOpen(false);
      setIsDeleting(false);
      setDeleteError("영상을 삭제하지 못했습니다.");
    }
  }

  useEffect(() => {
    if (video === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (index === null) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") navigate((index - 1 + videos.length) % videos.length);
      if (e.key === "ArrowRight") navigate((index + 1) % videos.length);
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, index, videos.length]);

  return (
    <>
    <AnimatePresence>
      {video && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
        >
          <button
            type="button"
            onClick={closeModal}
            aria-label="닫기"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-2xl text-text/80 transition-colors hover:text-pink sm:right-6 sm:top-6"
          >
            ✕
          </button>

          {videos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate((index - 1 + videos.length) % videos.length);
                }}
                aria-label="이전 영상"
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-3xl text-text/70 transition-colors hover:text-pink sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate((index + 1) % videos.length);
                }}
                aria-label="다음 영상"
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-3xl text-text/70 transition-colors hover:text-pink sm:right-6"
              >
                ›
              </button>
            </>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto border border-white/10 bg-bg-soft"
          >
            <div className="aspect-video w-full bg-black">
              <VideoFrame video={video} />
            </div>

            <div className="flex flex-col gap-2 px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-white/20 px-2 py-1 text-[10px] tracking-[0.15em] text-text-soft">
                  {getPlatformBadge(video.platform)}
                </span>
                <span className="border border-white/20 px-2 py-1 text-[10px] tracking-[0.15em] text-text-soft">
                  {getCategoryLabel(video.category)}
                </span>
                {video.best_rank !== null && (
                  <span className="border border-star/40 px-2 py-1 text-[10px] tracking-[0.1em] text-star">
                    ⭐ 2026 BEST #{video.best_rank}
                  </span>
                )}
              </div>
              <h3 className="font-serif-kr text-lg text-text sm:text-xl">{video.title}</h3>
              <p className="text-xs tracking-[0.15em] text-star">From. {video.nickname}</p>
              {video.message && (
                <p className="font-serif-kr mt-3 whitespace-pre-wrap text-sm italic leading-relaxed text-pink/90 sm:text-base">
                  {video.message}
                </p>
              )}
              <p className="mt-4 text-xs text-text-soft/60">{formatDate(video.created_at)}</p>

              {deleteError && <p className="mt-2 text-right text-xs text-pink">{deleteError}</p>}

              <div className="mt-4 flex justify-end border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="border border-pink/30 px-4 py-1.5 text-[11px] tracking-[0.15em] text-pink/80 transition-colors hover:border-pink hover:text-pink"
                >
                  영상 삭제
                </button>
              </div>
            </div>
          </motion.div>

          {videos.length > 1 && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-text-soft">
              {index + 1} / {videos.length}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>

    <ConfirmDialog
      open={confirmOpen}
      message="정말 이 영상을 삭제하시겠습니까?"
      isProcessing={isDeleting}
      onConfirm={handleConfirmDelete}
      onCancel={() => setConfirmOpen(false)}
    />
    </>
  );
}
