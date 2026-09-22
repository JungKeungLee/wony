"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { submitVideo } from "@/lib/videos";
import { toErrorMessage } from "@/lib/letters";
import { getMissingSupabaseEnvVars, isSupabaseConfigured } from "@/lib/supabase";
import { getPlatformLabel, parseVideoUrl } from "@/lib/videoPlatform";
import { VIDEO_CATEGORIES, getCategoryLabel } from "@/lib/videoCategory";
import { validateImageFile, prepareThumbnailForUpload } from "@/lib/imageProcessing";
import { uploadVideoThumbnail } from "@/lib/videoThumbnails";
import { VIDEO_VOTING_ENABLED } from "@/lib/constants";
import type { VideoCategory, VideoPlatform } from "@/lib/types";

const MAX_TITLE = 100;

interface FieldErrors {
  title?: string;
  url?: string;
  month?: string;
  category?: string;
  thumbnail?: string;
}

export default function VideoForm() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState<VideoCategory | "">("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState("");
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const parsed = url.trim() ? parseVideoUrl(url) : null;
  const urlRecognitionMessage = !url.trim()
    ? null
    : parsed
      ? getPlatformLabel(parsed.platform)
      : "현재 YouTube와 SOOP 영상만 등록할 수 있습니다.";

  const thumbnailPreviewUrl = useMemo(
    () => (thumbnailFile ? URL.createObjectURL(thumbnailFile) : null),
    [thumbnailFile]
  );

  // thumbnailPreviewUrl(useMemo)이 새로 만들어지거나 폼이 사라질 때 이전 URL을
  // 해제한다. setState는 하지 않는다(ArchiveEntryForm과 동일한 패턴).
  useEffect(() => {
    if (!thumbnailPreviewUrl) return;
    return () => URL.revokeObjectURL(thumbnailPreviewUrl);
  }, [thumbnailPreviewUrl]);

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

  function handleThumbnailPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setErrors((prev) => ({ ...prev, thumbnail: validationError }));
      return;
    }
    setErrors((prev) => ({ ...prev, thumbnail: undefined }));
    setThumbnailFile(file);
  }

  /**
   * 대표 썸네일 경로를 정한다. 사용자가 직접 이미지를 골랐으면 그걸 그대로
   * 업로드해서 쓰고, SOOP인데 직접 고른 이미지가 없으면 서버에서 og:image 자동
   * 추출을 시도한다(YouTube는 이미 hqdefault.jpg로 충분해 시도하지 않는다).
   * 어느 쪽이든 실패해도 조용히 null을 반환해 영상 등록 자체는 막지 않는다.
   */
  async function resolveThumbnailPath(platform: VideoPlatform, videoId: string): Promise<string | null> {
    if (thumbnailFile) {
      try {
        const blob = await prepareThumbnailForUpload(thumbnailFile);
        return await uploadVideoThumbnail(blob);
      } catch {
        return null;
      }
    }

    if (platform !== "soop") return null;

    try {
      const res = await fetch("/api/soop-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { thumbnailPath: string | null };
      return data.thumbnailPath;
    } catch {
      return null;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !parsed || !category) return;

    setSubmitState("submitting");
    try {
      const thumbnailPath = await resolveThumbnailPath(parsed.platform as VideoPlatform, parsed.videoId);
      await submitVideo({
        title: title.trim(),
        platform: parsed.platform as VideoPlatform,
        video_url: url.trim(),
        video_id: parsed.videoId,
        month: Number(month),
        category,
        thumbnail_path: thumbnailPath,
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

      <p className="font-serif-kr text-xs leading-relaxed text-text-soft/70">
        모든 영상을 올리기보다는 2026년 워니 방송 중 정말 기억에 남았던 순간을
        골라주세요.
        <br />
        YouTube / SOOP 영상을 등록할 수 있습니다.
        {VIDEO_VOTING_ENABLED && (
          <>
            <br />
            같은 영상에 여러 번 투표해도 괜찮습니다.
            <br />
            투표 결과는 공개되지 않으며 연말 콘텐츠 선정에 참고됩니다.
          </>
        )}
      </p>

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

      {parsed?.platform === "soop" && (
        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-[0.2em] text-text-soft">
            대표 썸네일 (선택)
          </span>
          <p className="text-[11px] leading-relaxed text-text-soft/60">
            비워두면 등록 시 SOOP 페이지에서 자동으로 가져옵니다. 잘 안 될 때만
            직접 올려주세요.
          </p>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleThumbnailPick}
            className="sr-only"
          />
          {thumbnailPreviewUrl && (
            <div className="relative aspect-video w-full max-w-[220px] overflow-hidden border border-white/10 bg-bg">
              <Image
                src={thumbnailPreviewUrl}
                alt="썸네일 미리보기"
                fill
                sizes="220px"
                unoptimized
                className="object-cover"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => thumbnailInputRef.current?.click()}
            className="w-fit border border-white/15 px-3 py-1.5 text-[11px] tracking-[0.1em] text-text-soft transition-colors hover:border-pink hover:text-pink"
          >
            {thumbnailFile ? "[ 이미지 다시 선택 ]" : "[ 이미지 선택 ]"}
          </button>
          {errors.thumbnail && <p className="text-xs text-pink">{errors.thumbnail}</p>}
        </div>
      )}

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
