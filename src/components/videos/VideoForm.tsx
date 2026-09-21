"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { submitVideo } from "@/lib/videos";
import { toErrorMessage } from "@/lib/letters";
import { getMissingSupabaseEnvVars, isSupabaseConfigured } from "@/lib/supabase";
import { getPlatformLabel, parseVideoUrl } from "@/lib/videoPlatform";
import { VIDEO_CATEGORIES, getCategoryLabel } from "@/lib/videoCategory";
import type { VideoCategory, VideoPlatform } from "@/lib/types";

const MAX_TITLE = 100;

interface FieldErrors {
  title?: string;
  url?: string;
  month?: string;
  category?: string;
}

export default function VideoForm() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState<VideoCategory | "">("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState("");

  const parsed = url.trim() ? parseVideoUrl(url) : null;
  const urlRecognitionMessage = !url.trim()
    ? null
    : parsed
      ? getPlatformLabel(parsed.platform)
      : "현재 YouTube와 SOOP 영상만 등록할 수 있습니다.";

  function validate(): boolean {
    const next: FieldErrors = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) next.title = "제목을 입력해주세요.";
    else if (trimmedTitle.length > MAX_TITLE)
      next.title = `제목은 ${MAX_TITLE}자 이내로 입력해주세요.`;

    if (!url.trim()) next.url = "영상 URL을 입력해주세요.";
    else if (!parsed) next.url = "현재 YouTube와 SOOP 영상만 등록할 수 있습니다.";

    if (!month) next.month = "몇 월 클립인지 선택해주세요.";
    if (!category) next.category = "카테고리를 선택해주세요.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !parsed || !category) return;

    setSubmitState("submitting");
    try {
      await submitVideo({
        title: title.trim(),
        platform: parsed.platform as VideoPlatform,
        video_url: url.trim(),
        video_id: parsed.videoId,
        month: Number(month),
        category,
      });
      setSubmitState("success");
    } catch (err) {
      setSubmitError(toErrorMessage(err));
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-28 text-center">
        <span className="text-4xl">🎬</span>
        <p className="font-serif-kr text-lg text-text sm:text-xl">
          영상이 잘 등록되었습니다.
        </p>
        <p className="text-sm text-text-soft">
          지금 바로 VIDEO 갤러리에서 확인할 수 있습니다.
        </p>
        <Link
          href="/videos"
          className="mt-4 border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink"
        >
          [ 영상 목록으로 돌아가기 ]
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto flex max-w-lg flex-col gap-8 px-6 pb-32"
    >
      {!isSupabaseConfigured && (
        <p className="border border-pink/30 bg-bg-soft px-4 py-3 text-xs text-pink/90">
          Supabase가 아직 연결되지 않아 영상을 등록할 수 없습니다. 관리자에게
          문의해주세요.
          <span className="block text-text-soft/60">
            누락된 환경변수: {getMissingSupabaseEnvVars().join(", ")}
          </span>
        </p>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="title" className="text-xs tracking-[0.2em] text-text-soft">
            제목
          </label>
          <span className="text-[11px] text-text-soft/60">
            {title.length}/{MAX_TITLE}
          </span>
        </div>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE}
          placeholder="예) 워니와 함께한 2026년"
          className="border border-white/15 bg-bg-soft px-4 py-3 text-text outline-none transition-colors focus:border-pink"
        />
        {errors.title && <p className="text-xs text-pink">{errors.title}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="url" className="text-xs tracking-[0.2em] text-text-soft">
          영상 URL (YouTube 또는 SOOP)
        </label>
        <input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=... 또는 https://vod.sooplive.co.kr/player/..."
          className="border border-white/15 bg-bg-soft px-4 py-3 text-text outline-none transition-colors focus:border-pink"
        />
        {urlRecognitionMessage && (
          <p className={parsed ? "text-xs text-star" : "text-xs text-pink"}>
            {urlRecognitionMessage}
          </p>
        )}
        {errors.url && <p className="text-xs text-pink">{errors.url}</p>}
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="month" className="text-xs tracking-[0.2em] text-text-soft">
            몇 월 클립인가요?
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-white/15 bg-bg-soft px-4 py-3 text-text outline-none transition-colors focus:border-pink"
          >
            <option value="">선택해주세요</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
          {errors.month && <p className="text-xs text-pink">{errors.month}</p>}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="category" className="text-xs tracking-[0.2em] text-text-soft">
            카테고리
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as VideoCategory)}
            className="border border-white/15 bg-bg-soft px-4 py-3 text-text outline-none transition-colors focus:border-pink"
          >
            <option value="">선택해주세요</option>
            {VIDEO_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {getCategoryLabel(c)}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-pink">{errors.category}</p>}
        </div>
      </div>

      {submitState === "error" && (
        <p className="border border-pink/30 bg-bg-soft px-4 py-3 text-xs text-pink/90">
          영상을 등록하지 못했습니다. 잠시 후 다시 시도해주세요.
          {submitError && <span className="block text-text-soft/60">{submitError}</span>}
        </p>
      )}

      <button
        type="submit"
        disabled={submitState === "submitting" || !isSupabaseConfigured}
        className="border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitState === "submitting" ? "등록하는 중..." : "영상 등록하기"}
      </button>
    </form>
  );
}
