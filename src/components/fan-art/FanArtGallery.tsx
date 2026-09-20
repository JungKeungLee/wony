"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApprovedFanArt } from "@/lib/fanArt";
import { toErrorMessage } from "@/lib/letters";
import type { FanArt } from "@/lib/types";
import FanArtCard from "./FanArtCard";
import FanArtModal from "./FanArtModal";

type Status = "loading" | "success" | "error";

export default function FanArtGallery() {
  const [status, setStatus] = useState<Status>("loading");
  const [arts, setArts] = useState<FanArt[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchApprovedFanArt();
        if (cancelled) return;
        setArts(data);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(toErrorMessage(err, "팬아트를 불러오지 못했습니다."));
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
        <p className="text-sm tracking-[0.2em]">팬아트를 불러오는 중...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-serif-kr text-text-soft">팬아트를 불러오지 못했습니다.</p>
        <p className="mt-2 text-xs text-text-soft/60">{errorMessage}</p>
      </div>
    );
  }

  if (arts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 px-6 py-24 text-center">
        <p className="font-serif-kr text-text-soft">
          아직 전시된 팬아트가 없습니다.
          <br />
          첫 번째 작품을 보내주세요.
        </p>
        <Link
          href="/fan-art/write"
          className="border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink"
        >
          [ 팬아트 보내기 ]
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl columns-1 gap-5 px-6 pb-32 sm:columns-2 lg:columns-3">
        {arts.map((art, i) => (
          <FanArtCard
            key={art.id}
            art={art}
            delay={(i % 6) * 0.06}
            onOpen={() => setActiveIndex(i)}
          />
        ))}
      </div>

      <FanArtModal
        arts={arts}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </>
  );
}
