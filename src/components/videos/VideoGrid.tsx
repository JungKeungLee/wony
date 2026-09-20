"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApprovedVideos } from "@/lib/videos";
import { toErrorMessage } from "@/lib/letters";
import type { VideoItem } from "@/lib/types";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";

type Status = "loading" | "success" | "error";

export default function VideoGrid() {
  const [status, setStatus] = useState<Status>("loading");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-6 pb-32 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            delay={(i % 6) * 0.08}
            onOpen={() => setActiveIndex(i)}
          />
        ))}
      </div>

      <VideoModal
        videos={videos}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </>
  );
}
