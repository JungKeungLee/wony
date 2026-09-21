"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { ArchiveItem } from "@/data/archive";
import { fetchArchiveImageById, getArchiveImageUrl } from "@/lib/archiveImages";
import { fetchArchiveCommentById } from "@/lib/archiveComments";
import { archiveEntryToItem, fetchArchiveEntries } from "@/lib/archiveEntries";
import type { ArchiveComment, ArchiveImage } from "@/lib/types";

function pickRandomIndex(length: number, excludeIndex: number | null): number {
  if (length <= 1) return 0;
  let next = Math.floor(Math.random() * length);
  while (next === excludeIndex) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

/**
 * HOME 페이지의 작은 "기억 상자". ARCHIVE의 실시간 데이터(date/title/description/tags,
 * Supabase archive_entries)와, 있다면 대표 이미지 / MEMORY NOTE를 archive_id 기준으로
 * 함께 불러와 무작위로 하나씩 열어본다. archive_entries를 직접 등록/수정/삭제해도 이
 * 목록이 항상 최신 상태를 반영하도록 정적 데이터 대신 Supabase에서 가져온다.
 * ARCHIVE 자체의 정렬/필터/데이터는 전혀 건드리지 않는다 - 읽기 전용으로 재활용만 한다.
 */
export default function RandomMemoryTeaser() {
  const [memories, setMemories] = useState<ArchiveItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const [image, setImage] = useState<ArchiveImage | null>(null);
  const [comment, setComment] = useState<ArchiveComment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchArchiveEntries()
      .then((rows) => {
        if (!cancelled) setMemories(rows.map(archiveEntryToItem));
      })
      .catch(() => {
        // 목록을 못 불러오면 버튼이 그냥 비활성 상태로 남는다.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function openMemory(nextIndex: number) {
    const item = memories[nextIndex];
    setIndex(nextIndex);
    setIsOpen(true);
    setIsLoading(true);
    setImage(null);
    setComment(null);
    // 대표 이미지/코멘트 조회 실패는 상자를 여는 것 자체를 막을 정도는 아니므로,
    // 각각 조용히 null로 처리하고 ARCHIVE의 고정 데이터(date/title/description/tags)
    // 만이라도 보여준다.
    const [img, note] = await Promise.all([
      fetchArchiveImageById(item.id).catch(() => null),
      fetchArchiveCommentById(item.id).catch(() => null),
    ]);
    setImage(img);
    setComment(note);
    setIsLoading(false);
  }

  function handleOpenRandom() {
    if (memories.length === 0) return;
    openMemory(pickRandomIndex(memories.length, index));
  }

  function closeModal() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const item = index !== null ? memories[index] : null;

  return (
    <section className="mx-auto max-w-5xl px-6 pb-20 text-center">
      <button
        type="button"
        onClick={handleOpenRandom}
        disabled={memories.length === 0}
        className="group mx-auto flex flex-col items-center gap-2 border border-white/10 bg-bg-soft/40 px-10 py-7 transition-colors hover:border-star/40 hover:bg-bg-soft/70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span
          aria-hidden
          className="text-lg text-star transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_rgba(255,230,167,0.6)]"
        >
          ✦
        </span>
        <span className="font-display text-sm tracking-[0.25em] text-text">
          오늘의 추억 열기
        </span>
        <span className="font-serif-kr text-xs text-text-soft">
          2026년의 기록 중 하나를 우연히 꺼내봅니다.
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={closeModal}
              aria-label="닫기"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-2xl text-text/80 transition-colors hover:text-pink sm:right-6 sm:top-6"
            >
              ✕
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto border border-star/20 bg-bg-soft text-left"
            >
              {isLoading ? (
                <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
                  <span className="animate-pulse text-xl text-star">✦</span>
                  <p className="font-serif-kr text-sm text-text-soft">
                    상자를 여는 중...
                  </p>
                </div>
              ) : (
                item && (
                  <>
                    {image && (
                      <div className="relative aspect-video w-full bg-black">
                        <Image
                          key={image.image_path}
                          src={getArchiveImageUrl(image.image_path)}
                          alt={`${item.title} 대표 이미지`}
                          fill
                          sizes="(max-width: 640px) 100vw, 512px"
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-3 px-7 py-7 sm:px-8">
                      <span className="font-display text-xs tracking-[0.2em] text-star">
                        {item.date}
                      </span>
                      <h3 className="font-serif-kr text-xl text-text sm:text-2xl">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-text-soft sm:text-base">
                          {item.description}
                        </p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-white/15 px-2 py-0.5 text-[10px] tracking-[0.05em] text-text-soft"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {comment && (
                        <div className="mt-2 border-t border-white/10 pt-3">
                          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] tracking-[0.15em] text-star/80">
                            <span aria-hidden>✦</span>
                            <span>그날의 기록</span>
                          </div>
                          <p className="font-serif-kr whitespace-pre-wrap text-sm leading-relaxed text-text-soft">
                            {comment.comment}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end border-t border-white/10 pt-4">
                        <button
                          type="button"
                          onClick={handleOpenRandom}
                          className="border border-text-soft/40 px-5 py-2 text-xs tracking-[0.15em] text-text-soft transition-colors hover:border-star hover:text-star"
                        >
                          [ 다른 추억 보기 ]
                        </button>
                      </div>
                    </div>
                  </>
                )
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
