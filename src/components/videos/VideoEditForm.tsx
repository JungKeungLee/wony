"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { updateVideo } from "@/lib/videos";
import { toErrorMessage } from "@/lib/letters";
import { getPlatformLabel, parseVideoUrl, resolveVideoThumbnail } from "@/lib/videoPlatform";
import { VIDEO_CATEGORIES, getCategoryLabel } from "@/lib/videoCategory";
import { validateImageFile, prepareThumbnailForUpload } from "@/lib/imageProcessing";
import { uploadVideoThumbnail } from "@/lib/videoThumbnails";
import type { VideoCategory, VideoItem, VideoPlatform } from "@/lib/types";

const MAX_TITLE = 100;

interface FieldErrors {
  title?: string;
  url?: string;
  month?: string;
  category?: string;
  thumbnail?: string;
}

interface VideoEditFormProps {
  /** null이면 닫힌 상태. 값이 있으면 그 영상의 현재 값으로 폼을 채운다. */
  video: VideoItem | null;
  onSaved: (updated: VideoItem) => void;
  onClose: () => void;
}

/**
 * VIDEO 상세 Modal의 [수정]에서 여는 통합 편집 Modal. 제목/URL(플랫폼·영상 ID
 * 재계산)/월/카테고리/대표 썸네일을 한 번에 고칠 수 있다. nickname/message/
 * best_rank/is_approved는 화면에서 다루지 않는다(best_rank는 DB 트리거로도 보호됨).
 * SOOP 자동 추출은 등록 시점에만 하고, 여기서는 URL을 바꿔도 자동으로 다시
 * 추출하지 않는다 - 저장할 때마다 예상 못한 외부 요청이 나가지 않도록, 썸네일을
 * 바꾸고 싶으면 항상 직접 업로드하게 한다.
 */
export default function VideoEditForm({ video, onSaved, onClose }: VideoEditFormProps) {
  const isOpen = video !== null;

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState<VideoCategory | "">("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Modal이 새로 열릴 때마다(다른 영상을 수정하러 열든) 그 시점 값으로 다시 채운다.
  useEffect(() => {
    if (!video) return;
    const timer = setTimeout(() => {
      setTitle(video.title);
      setUrl(video.video_url);
      setMonth(String(video.month));
      setCategory(video.category);
      setThumbnailFile(null);
      setRemoveThumbnail(false);
      setErrors({});
      setSaveState("idle");
      setSaveError("");
    }, 0);
    return () => clearTimeout(timer);
  }, [video]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

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
  useEffect(() => {
    if (!thumbnailPreviewUrl) return;
    return () => URL.revokeObjectURL(thumbnailPreviewUrl);
  }, [thumbnailPreviewUrl]);

  const existingThumbnailUrl = video ? resolveVideoThumbnail(video) : null;
  const displayThumbnailUrl = thumbnailPreviewUrl ?? (removeThumbnail ? null : existingThumbnailUrl);

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
    setRemoveThumbnail(false);
  }

  function handleRemoveThumbnail() {
    setThumbnailFile(null);
    setRemoveThumbnail(true);
  }

  function handleUndoRemoveThumbnail() {
    setRemoveThumbnail(false);
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) next.title = "제목을 입력해주세요.";
    else if (trimmedTitle.length > MAX_TITLE) next.title = `제목은 ${MAX_TITLE}자 이내로 입력해주세요.`;

    if (!url.trim()) next.url = "영상 URL을 입력해주세요.";
    else if (!parsed) next.url = "현재 YouTube와 SOOP 영상만 등록할 수 있습니다.";

    if (!month) next.month = "몇 월 클립인지 선택해주세요.";
    if (!category) next.category = "카테고리를 선택해주세요.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!video || !validate() || !parsed || !category) return;

    setSaveState("saving");
    try {
      let thumbnailPath = video.thumbnail_path;
      if (thumbnailFile) {
        const blob = await prepareThumbnailForUpload(thumbnailFile);
        thumbnailPath = await uploadVideoThumbnail(blob);
      } else if (removeThumbnail) {
        thumbnailPath = null;
      }

      const updated = await updateVideo(video.id, {
        title: title.trim(),
        platform: parsed.platform as VideoPlatform,
        video_url: url.trim(),
        video_id: parsed.videoId,
        month: Number(month),
        category,
        thumbnail_path: thumbnailPath,
      });
      setSaveState("idle");
      onSaved(updated);
    } catch (err) {
      setSaveError(toErrorMessage(err, "영상을 수정하지 못했습니다."));
      setSaveState("error");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-md overflow-y-auto border border-white/10 bg-bg-soft"
          >
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 px-6 py-7 sm:px-8">
              <p className="font-display text-sm tracking-[0.2em] text-star">영상 수정</p>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-title" className="text-xs tracking-[0.15em] text-text-soft">
                  제목
                </label>
                <input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={MAX_TITLE}
                  className="border border-white/15 bg-bg px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-star"
                />
                {errors.title && <p className="text-xs text-pink">{errors.title}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-url" className="text-xs tracking-[0.15em] text-text-soft">
                  영상 URL (YouTube 또는 SOOP)
                </label>
                <input
                  id="edit-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="border border-white/15 bg-bg px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-star"
                />
                {urlRecognitionMessage && (
                  <p className={parsed ? "text-xs text-star" : "text-xs text-pink"}>
                    {urlRecognitionMessage}
                  </p>
                )}
                {errors.url && <p className="text-xs text-pink">{errors.url}</p>}
              </div>

              <div className="flex flex-col gap-6 sm:flex-row sm:gap-4">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="edit-month" className="text-xs tracking-[0.15em] text-text-soft">
                    몇 월 클립인가요?
                  </label>
                  <select
                    id="edit-month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="border border-white/15 bg-bg px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-star"
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

                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="edit-category" className="text-xs tracking-[0.15em] text-text-soft">
                    카테고리
                  </label>
                  <select
                    id="edit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VideoCategory)}
                    className="border border-white/15 bg-bg px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-star"
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

              {parsed?.platform === "soop" && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs tracking-[0.15em] text-text-soft">대표 썸네일</span>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailPick}
                    className="sr-only"
                  />
                  {displayThumbnailUrl ? (
                    <div className="relative aspect-video w-full max-w-[220px] overflow-hidden border border-white/10 bg-bg">
                      <Image
                        src={displayThumbnailUrl}
                        alt="썸네일 미리보기"
                        fill
                        sizes="220px"
                        unoptimized={Boolean(thumbnailPreviewUrl)}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full max-w-[220px] items-center justify-center border border-dashed border-white/15 text-xs text-text-soft/50">
                      선택된 이미지 없음
                    </div>
                  )}
                  <div className="flex gap-3 text-[11px] tracking-[0.1em]">
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="border border-white/15 px-3 py-1.5 text-text-soft transition-colors hover:border-star hover:text-star"
                    >
                      [ 이미지 변경 ]
                    </button>
                    {displayThumbnailUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveThumbnail}
                        className="border border-white/15 px-3 py-1.5 text-text-soft transition-colors hover:border-pink hover:text-pink"
                      >
                        [ 이미지 삭제 ]
                      </button>
                    )}
                    {removeThumbnail && existingThumbnailUrl && (
                      <button
                        type="button"
                        onClick={handleUndoRemoveThumbnail}
                        className="px-1 py-1.5 text-text-soft/70 underline underline-offset-4 transition-colors hover:text-star"
                      >
                        삭제 취소
                      </button>
                    )}
                  </div>
                  {errors.thumbnail && <p className="text-xs text-pink">{errors.thumbnail}</p>}
                </div>
              )}

              {saveState === "error" && (
                <p className="border border-pink/30 bg-bg px-3 py-2 text-xs text-pink/90">{saveError}</p>
              )}

              <div className="mt-1 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saveState === "saving"}
                  className="border border-white/15 px-5 py-2 text-xs tracking-[0.15em] text-text-soft transition-colors hover:border-text-soft/60 hover:text-text disabled:opacity-40"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saveState === "saving"}
                  className="border border-text-soft/40 px-5 py-2 text-xs tracking-[0.15em] text-text transition-colors hover:border-star hover:text-star disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saveState === "saving" ? "저장하는 중..." : "수정 완료"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
