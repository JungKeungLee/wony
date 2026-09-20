"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchApprovedVideos } from "@/lib/videos";
import { toErrorMessage } from "@/lib/letters";
import { MONTH_LABELS_EN, MONTH_LABELS_FULL } from "@/lib/videoCategory";
import type { VideoItem } from "@/lib/types";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import BestClipsSection from "./BestClipsSection";

type Status = "loading" | "success" | "error";

export default function VideoGrid() {
  const [status, setStatus] = useState<Status>("loading");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  /** 현재 열려 있는 Modal이 어느 목록(월 섹션 또는 BEST) 안에서 이전/다음 이동을 해야 하는지 */
  const [modalList, setModalList] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  /** null이면 ALL */
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchApprovedVideos();
        if (cancelled) return;
        setVideos(data);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(toErrorMessage(err, "영상을 불러오지 못했습니다."));
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function selectMonth(month: number | null) {
    setSelectedMonth(month);
    setActiveVideo(null);
  }

  function openVideo(list: VideoItem[], video: VideoItem) {
    setModalList(list);
    setActiveVideo(video);
  }

  const filtered = useMemo(
    () => (selectedMonth === null ? videos : videos.filter((v) => v.month === selectedMonth)),
    [videos, selectedMonth]
  );

  const monthGroups = useMemo(() => {
    const map = new Map<number, VideoItem[]>();
    for (const video of filtered) {
      const list = map.get(video.month) ?? [];
      list.push(video);
      map.set(video.month, list);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([month, items]) => ({ month, items }));
  }, [filtered]);

  const bestVideos = useMemo(
    () =>
      videos
        .filter((v): v is VideoItem & { best_rank: number } => v.best_rank !== null)
        .sort((a, b) => a.best_rank - b.best_rank),
    [videos]
  );

  const activeIndex = activeVideo ? modalList.findIndex((v) => v.id === activeVideo.id) : null;

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-text-soft">
        <span className="animate-pulse text-2xl text-star">✦</span>
        <p className="text-sm tracking-[0.2em]">영상을 불러오는 중...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-serif-kr text-text-soft">영상을 불러오지 못했습니다.</p>
        <p className="mt-2 text-xs text-text-soft/60">{errorMessage}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 px-6 py-24 text-center">
        <p className="font-serif-kr text-text-soft">
          아직 등록된 영상이 없습니다.
          <br />
          첫 번째 영상을 보내주세요.
        </p>
        <Link
          href="/videos/write"
          className="border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink"
        >
          [ 영상 등록하기 ]
        </Link>
      </div>
    );
  }

  return (
    <>
      <nav
        aria-label="월별 클립 필터"
        className="sticky top-16 z-30 border-y border-white/10 bg-bg/85 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 py-3 sm:justify-center sm:gap-2 sm:px-6">
          <button
            type="button"
            onClick={() => selectMonth(null)}
            className={`shrink-0 px-3 py-1.5 text-xs tracking-[0.15em] transition-colors ${
              selectedMonth === null ? "text-pink" : "text-text-soft hover:text-text"
            }`}
          >
            ALL
          </button>
          {MONTH_LABELS_EN.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => selectMonth(i + 1)}
              className={`shrink-0 px-3 py-1.5 text-xs tracking-[0.15em] transition-colors ${
                selectedMonth === i + 1 ? "text-pink" : "text-text-soft hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {monthGroups.length === 0 ? (
        <div className="px-6 py-24 text-center">
          <p className="font-serif-kr text-text-soft">아직 선정된 클립이 없습니다.</p>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl px-6 pb-8">
          {monthGroups.map(({ month, items }) => (
            <section key={month} className="py-10">
              <div className="mb-6 flex items-baseline gap-3">
                <span className="font-display text-2xl text-text-soft/30 sm:text-3xl">
                  {String(month).padStart(2, "0")}
                </span>
                <span className="font-display text-sm tracking-[0.3em] text-star">
                  {MONTH_LABELS_FULL[month - 1]}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((video, i) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    delay={(i % 6) * 0.06}
                    onOpen={() => openVideo(items, video)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <BestClipsSection videos={bestVideos} onOpen={(video) => openVideo(bestVideos, video)} />

      <VideoModal
        videos={modalList}
        index={activeIndex}
        onClose={() => setActiveVideo(null)}
        onNavigate={(i) => setActiveVideo(modalList[i] ?? null)}
      />
    </>
  );
}
