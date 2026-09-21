"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toErrorMessage } from "@/lib/letters";
import type { ArchiveEntryInput } from "@/lib/types";

interface ArchiveEntryFormProps {
  /** null이면 닫힌 상태. "create"면 빈 값, 그 외에는 수정할 기존 값을 미리 채운다. */
  state:
    | null
    | { mode: "create" }
    | { mode: "edit"; archiveId: string; initial: ArchiveEntryInput };
  onSubmit: (input: ArchiveEntryInput) => Promise<void>;
  onClose: () => void;
}

const MAX_TITLE = 100;
const MAX_DESCRIPTION = 300;
const MAX_TAG = 20;
const MAX_TAGS = 10;

/**
 * ARCHIVE 기록 등록/수정용 작은 모달. 화면 표기는 날짜/메인주제/서브주제/해시태그를
 * 쓴다(내부적으로는 date/title/description/tags). 해시태그는 textarea 대신 칩 형태로
 * 추가/삭제한다.
 */
export default function ArchiveEntryForm({ state, onSubmit, onClose }: ArchiveEntryFormProps) {
  const isOpen = state !== null;
  const isEdit = state?.mode === "edit";

  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [errors, setErrors] = useState<{ date?: string; title?: string }>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");
  const [saveError, setSaveError] = useState("");

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
      } else {
        setDate("");
        setTitle("");
        setDescription("");
        setTags([]);
      }
      setTagDraft("");
      setErrors({});
      setSaveState("idle");
      setSaveError("");
    }, 0);
    return () => clearTimeout(timer);
  }, [state]);

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

  function validate(): ArchiveEntryInput | null {
    const next: { date?: string; title?: string } = {};
    const trimmedDate = date.trim();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedDate) next.date = "날짜를 입력해주세요.";
    if (!trimmedTitle) next.title = "메인주제를 입력해주세요.";
    else if (trimmedTitle.length > MAX_TITLE) next.title = `메인주제는 ${MAX_TITLE}자 이내로 입력해주세요.`;

    setErrors(next);
    if (Object.keys(next).length > 0) return null;

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
      await onSubmit(input);
      setSaveState("idle");
      onClose();
    } catch (err) {
      setSaveError(toErrorMessage(err, "기록을 저장하지 못했습니다."));
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
