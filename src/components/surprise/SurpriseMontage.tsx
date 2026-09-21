"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { fetchTimelineImages, getTimelineImageUrl } from "@/lib/timelineImages";
import type { TimelineImageRow } from "@/lib/types";

const MAX_PHOTOS = 12;
const MIN_PHOTOS = 3;

/**
 * 일반 재생 시: 사진 한 장당 유지 시간 / 전환 시간(ms).
 * 전체 길이(15~25초) 안에 들어오도록, 사진 최대 장수(MAX_PHOTOS) * HOLD_MS +
 * CLOSING_HOLD_MS가 대략 20초 안팎이 되게 맞춘다.
 */
const HOLD_MS = 1500;
const FADE_MS = 900;
/** reduced-motion: 애니메이션은 최소화하되, 그래도 몇 장은 순서대로 보여준다. */
const REDUCED_HOLD_MS = 700;
const REDUCED_FADE_MS = 150;
const CLOSING_HOLD_MS = 2600;

const CAPTIONS = ["웃었던 날들", "함께했던 순간들", "평범해서 더 좋았던 날들", "그리고 우리의 2026"];

function captionForRatio(ratio: number): string {
  if (ratio < 0.25) return CAPTIONS[0];
  if (ratio < 0.55) return CAPTIONS[1];
  if (ratio < 0.85) return CAPTIONS[2];
  return CAPTIONS[3];
}

interface SurpriseMontageProps {
  onComplete: () => void;
}

/**
 * SURPRISE 오프닝 직후, 긴 편지로 넘어가기 전에 짧게 재생되는 2026년 회상 몽타주.
 * TIMELINE에 이미 등록된 월별 대표 이미지를 그대로 재활용한다(새 이미지 업로드 없음,
 * 별도 DB도 만들지 않음). SurpriseOpening과 동일하게 전체 화면을 덮는 시퀀스로 만들어,
 * 사용자가 스크롤하지 않아도 자동으로 재생되고 끝나면 onComplete로 다음 단계(자동
 * 스크롤 시작)에 넘겨준다.
 */
export default function SurpriseMontage({ onComplete }: SurpriseMontageProps) {
  const prefersReducedMotion = useReducedMotion();
  const [photos, setPhotos] = useState<TimelineImageRow[] | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"loading" | "photos" | "closing" | "done">("loading");

  const holdMs = prefersReducedMotion ? REDUCED_HOLD_MS : HOLD_MS;
  const fadeMs = prefersReducedMotion ? REDUCED_FADE_MS : FADE_MS;

  // TIMELINE 대표 이미지를 월 순서대로 불러온다. 등록된 사진이 너무 적으면(3장 미만)
  // 몽타주를 건너뛰고 곧바로 다음 단계로 넘어간다 - 빈 화면이 오래 떠 있지 않게 한다.
  useEffect(() => {
    let cancelled = false;

    fetchTimelineImages()
      .then((map) => {
        if (cancelled) return;
        const sorted = Array.from(map.values())
          .sort((a, b) => a.month - b.month)
          .slice(0, MAX_PHOTOS);
        if (sorted.length < MIN_PHOTOS) {
          setPhase("done");
          return;
        }
        setPhotos(sorted);
        setPhase("photos");
      })
      .catch(() => {
        if (!cancelled) setPhase("done");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 사진 슬라이드 진행. index는 effect가 매번 최신값을 다시 읽도록 deps에 그대로 둔다.
  useEffect(() => {
    if (phase !== "photos" || !photos) return;
    const timer = setTimeout(() => {
      if (index >= photos.length - 1) {
        setPhase("closing");
      } else {
        setIndex(index + 1);
      }
    }, holdMs);
    return () => clearTimeout(timer);
  }, [phase, photos, index, holdMs]);

  // 마지막 문구를 잠시 보여준 뒤 완료.
  useEffect(() => {
    if (phase !== "closing") return;
    const timer = setTimeout(() => setPhase("done"), CLOSING_HOLD_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") onComplete();
    // onComplete는 부모(SurpriseExperience)가 매 렌더 새로 만들어 넘길 수 있어 deps에서
    // 제외한다 - phase가 "done"이 되는 그 순간에만 정확히 한 번 호출하면 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "loading" || phase === "done" || !photos) return null;

  const ratio = photos.length > 1 ? index / (photos.length - 1) : 1;
  const caption = captionForRatio(ratio);
  const current = photos[index];

  return (
    <div className="fixed inset-0 z-[65] flex flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
      <AnimatePresence mode="wait">
        {phase === "photos" && current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeMs / 1000, ease: "easeInOut" }}
            className="relative aspect-[4/3] w-full max-w-md overflow-hidden border border-white/10"
          >
            <Image
              src={getTimelineImageUrl(current.image_path)}
              alt=""
              fill
              sizes="(max-width: 640px) 90vw, 448px"
              className="object-cover"
              priority
            />
          </motion.div>
        )}

        {phase === "closing" && (
          <motion.p
            key="closing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 1, ease: "easeOut" }}
            className="font-display text-2xl tracking-wide text-text sm:text-3xl"
          >
            우리가 함께 만든 2026년
          </motion.p>
        )}
      </AnimatePresence>

      {phase === "photos" && (
        <motion.p
          key={caption}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.7, ease: "easeOut" }}
          className="font-serif-kr text-sm tracking-[0.1em] text-text-soft sm:text-base"
        >
          {caption}
        </motion.p>
      )}
    </div>
  );
}
