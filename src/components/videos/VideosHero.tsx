"use client";

import Link from "next/link";
import { useSiteMode } from "@/context/SiteModeContext";
import { VIDEO_VOTING_ENABLED } from "@/lib/constants";

export default function VideosHero() {
  const { isContributeMode } = useSiteMode();

  return (
    <section className="relative flex flex-col items-center gap-6 px-6 pb-14 pt-32 text-center sm:pt-40">
      <span className="font-display text-xs tracking-[0.4em] text-star">
        WONY VIDEO
      </span>
      <h1 className="font-serif-kr text-2xl leading-relaxed text-text sm:text-3xl">
        2026년의 기억에 남는 순간을
        <br />
        골라주세요.
      </h1>
      <p className="font-serif-kr max-w-md text-sm leading-relaxed text-text-soft sm:text-base">
        다시 보고 싶은 영상이나
        <br />
        기억에 남았던 장면이 있다면 남겨주세요.
        {VIDEO_VOTING_ENABLED && (
          <>
            <br />
            영상마다 마음에 드는 만큼
            <br />
            자유롭게 한 표를 보낼 수 있습니다. <span className="text-star">✦</span>
          </>
        )}
      </p>
      {/* VIDEO는 운영자가 미리 등록하는 구조라, contribute(고객) 모드에서는
          등록 버튼 자체를 보여주지 않는다(같은 이유로 /videos/write 라우트도
          CONTRIBUTE_ALLOWED_PATHS에서 막혀 있다). */}
      {!isContributeMode && (
        <Link
          href="/videos/write"
          className="mt-4 border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink"
        >
          [ + 영상 남기기 ]
        </Link>
      )}
    </section>
  );
}
