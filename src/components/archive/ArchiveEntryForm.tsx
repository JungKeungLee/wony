"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toErrorMessage } from "@/lib/letters";
import { validateImageFile } from "@/lib/imageProcessing";
import { getArchiveImageUrl } from "@/lib/archiveImages";
import type { ArchiveComment, ArchiveEntryInput, ArchiveImage } from "@/lib/types";

/** 등록/수정 제출 시 함께 넘기는 대표 이미지/MEMORY NOTE 변경 사항. */
export interface ArchiveEntryMedia {
  /** 사용자가 새로 고른 이미지 파일. null이면 이미지 변경 없음. */
  imageFile: File | null;
  /** true면 기존 대표 이미지를 삭제한다(imageFile이 있으면 이 값은 무시된다). */
  removeImage: boolean;
  /** 저장할 MEMORY NOTE 내용. 빈 문자열/공백만 있으면 삭제로 처리한다. */
  note: string;
}

interface ArchiveEntryFormProps {
  /** null이면 닫힌 상태. "create"면 빈 값, 그 외에는 수정할 기존 값을 미리 채운다. */
  state:
    | null
    | { mode: "create" }
    | {
        mode: "edit";
        archiveId: string;
        initial: ArchiveEntryInput;
        initialImage: ArchiveImage | null;
        initialComment: ArchiveComment | null;
      };
  onSubmit: (input: ArchiveEntryInput, media: ArchiveEntryMedia) => Promise<void>;
  onClose: () => void;
}

const MAX_TITLE = 100;
const MAX_DESCRIPTION = 300;
const MAX_TAG = 20;
const MAX_TAGS = 10;
const MAX_NOTE = 1000;

/**
 * ARCHIVE 기록 등록/수정용 통합 모달. 날짜/메인주제/서브주제/해시태그뿐 아니라
 * 대표 이미지, MEMORY NOTE까지 하나의 화면에서 한 번에 관리한다(내부적으로는
 * date/title/description/tags). 실제 Supabase 저장(엔트리 저장 -> 이미지 업로드 ->
 * 코멘트 저장 순서)은 onSubmit을 호출하는 쪽(ArchiveContent)에서 처리한다.
 */
export default function ArchiveEntryForm({ state, onSubmit, onClose }: ArchiveEntryFormProps) {
  const isOpen = state !== null;
  const isEdit = state?.mode === "edit";

  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ date?: string; title?: string; image?: string; note?: string }>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");
  const [saveError, setSaveError] = useState("");

  const [existingImage, setExistingImage] = useState<ArchiveImage | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 새로 고른 파일의 미리보기 URL. imageFile이 바뀔 때만 다시 만들고, 더 이상 쓰이지
  // 않게 되면(파일이 바뀌거나 모달이 닫히면) 아래 effect에서 정리한다.
  const imagePreviewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile]
  );

  // 모달이 새로 열릴 때마다(등록 모드로 열리든, 다른 항목의 수정 모드로 열리든)
  // 입력값을 그 시점에 맞게 다시 채운다.
  useEffect(() => {
    if (!state) return;
    const timer = setTimeout(() => {
      if (state.mode === "edit") {
        setDate(state.initial.date);
        setTitle(state.initial.title);
        setDescription(state.initial.description ?? "");
        setTags(state.initial.tags);
        setNote(state.initialComment?.comment ?? "");
        setExistingImage(state.initialImage);
      } else {
        setDate("");
        setTitle("");
        setDescription("");
        setTags([]);
        setNote("");
        setExistingImage(null);
      }
      setTagDraft("");
      setImageFile(null);
      setRemoveImage(false);
      setErrors({});
      setSaveState("idle");
      setSaveError("");
    }, 0);
    return () => clearTimeout(timer);
  }, [state]);

  // imagePreviewUrl(useMemo)이 새로 만들어지거나 이 컴포넌트가 사라질 때, 더는 쓰이지
  // 않는 이전 URL을 해제해 메모리 누수를 막는다. setState는 하지 않는다.
  useEffect(() => {
    if (!imagePreviewUrl) return;
    return () => URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

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

  function addTag() {
    const next = tagDraft.trim();
    if (!next) return;
    if (next.length > MAX_TAG) return;
    if (tags.includes(next)) {
      setTagDraft("");
      return;
    }
    if (tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, next]);
    setTagDraft("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      addTag();
    }
  }

  function handleImagePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setErrors((prev) => ({ ...prev, image: validationError }));
      return;
    }
    setErrors((prev) => ({ ...prev, image: undefined }));
    setImageFile(file);
    setRemoveImage(false);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setRemoveImage(true);
  }

  function handleUndoRemoveImage() {
    setRemoveImage(false);
  }

  function validate(): ArchiveEntryInput | null {
    const next: { date?: string; title?: string } = {};
    const trimmedDate = date.trim();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedDate) next.date = "날짜를 입력해주세요.";
    if (!trimmedTitle) next.title = "메인주제를 입력해주세요.";
    else if (trimmedTitle.length > MAX_TITLE) next.title = `메인주제는 ${MAX_TITLE}자 이내로 입력해주세요.`;

    const trimmedNote = note.trim();
    const noteError =
      trimmedNote.length > MAX_NOTE ? `MEMORY NOTE는 ${MAX_NOTE}자 이내로 입력해주세요.` : undefined;

    setErrors((prev) => ({ ...prev, date: next.date, title: next.title, note: noteError }));
    if (Object.keys(next).length > 0 || noteError) return null;

    return {
      date: trimmedDate,
      title: trimmedTitle,
      description: trimmedDescription ? trimmedDescription.slice(0, MAX_DESCRIPTION) : null,
      tags,
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input = validate();
    if (!input) return;

    setSaveState("saving");
    try {
      await onSubmit(input, { imageFile, removeImage, note: note.trim() });
      setSaveState("idle");
      onClose();
    } catch (err) {
      setSaveError(toErrorMessage(err, "기록을 저장하지 못했습니다."));
      setSaveState("error");
    }
  }

  const displayImageUrl = imagePreviewUrl
    ? imagePreviewUrl
    : !removeImage && existingImage
      ? getArchiveImageUrl(existingImage.image_path)
      : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
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
              <p className="font-display text-sm tracking-[0.2em] text-star">
                {isEdit ? "기록 수정" : "기록 추가"}
              </p>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="entry-date" className="text-xs tracking-[0.15em] text-text-soft">
                  날짜
                </label>
                <input
                  id="entry-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="예) 08.26 또는 03.29 ~ 04.08"
                  className="border border-white/15 bg-bg px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-star"
                />
                {errors.date && <p className="text-xs text-pink">{errors.date}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="entry-title" className="text-xs tracking-[0.15em] text-text-soft">
                  메인주제
                </label>
                <input
                  id="entry-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={MAX_TITLE}
                  placeholder="예) 세구님의 스까묵자 배그"
                  className="border border-white/15 bg-bg px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-star"
                />
                {errors.title && <p className="text-xs text-pink">{errors.title}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="entry-description" className="text-xs tracking-[0.15em] text-text-soft">
                  서브주제 (선택)
                </label>
                <input
                  id="entry-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={MAX_DESCRIPTION}
                  placeholder="예) 배틀그라운드"
                  className="border border-white/15 bg-bg px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-star"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs tracking-[0.15em] text-text-soft">해시태그 (선택)</span>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="border border-white/15 px-2 py-1 text-[11px] tracking-[0.05em] text-text-soft transition-colors hover:border-pink/50 hover:text-pink"
                      >
                        {tag} ×
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    maxLength={MAX_TAG}
                    placeholder="해시태그 입력 후 Enter"
                    className="flex-1 border border-white/15 bg-bg px-3 py-2 text-sm text-text outline-none transition-colors focus:border-star"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="shrink-0 border border-white/15 px-3 text-xs tracking-[0.1em] text-text-soft transition-colors hover:border-star hover:text-star"
                  >
                    + 추가
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs tracking-[0.15em] text-text-soft">대표 이미지 (선택)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImagePick}
                  className="sr-only"
                />
                {displayImageUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden border border-white/10 bg-bg">
                    <Image
                      src={displayImageUrl}
                      alt="대표 이미지 미리보기"
                      fill
                      sizes="400px"
                      className="object-cover"
                      unoptimized={Boolean(imagePreviewUrl)}
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center border border-dashed border-white/15 text-xs text-text-soft/50">
                    선택된 이미지 없음
                  </div>
                )}
                <div className="flex gap-3 text-[11px] tracking-[0.1em]">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-white/15 px-3 py-1.5 text-text-soft transition-colors hover:border-star hover:text-star"
                  >
                    {existingImage ? "[ 이미지 변경 ]" : "[ 이미지 선택 ]"}
                  </button>
                  {displayImageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="border border-white/15 px-3 py-1.5 text-text-soft transition-colors hover:border-pink hover:text-pink"
                    >
                      [ 이미지 삭제 ]
                    </button>
                  )}
                  {removeImage && existingImage && (
                    <button
                      type="button"
                      onClick={handleUndoRemoveImage}
                      className="px-1 py-1.5 text-text-soft/70 underline underline-offset-4 transition-colors hover:text-star"
                    >
                      삭제 취소
                    </button>
                  )}
                </div>
                {errors.image && <p className="text-xs text-pink">{errors.image}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="entry-note" className="text-xs tracking-[0.15em] text-text-soft">
                  MEMORY NOTE (선택)
                </label>
                <textarea
                  id="entry-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={MAX_NOTE}
                  rows={3}
                  placeholder="이 방송에 대한 짧은 기록을 남겨주세요."
                  className="font-serif-kr resize-none border border-white/15 bg-bg px-3 py-2 text-sm leading-relaxed text-text outline-none transition-colors focus:border-star"
                />
                {errors.note && <p className="text-xs text-pink">{errors.note}</p>}
              </div>

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
                  {saveState === "saving" ? "저장하는 중..." : isEdit ? "수정 완료" : "등록"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
