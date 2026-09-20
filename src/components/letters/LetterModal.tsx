"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { deleteLetter, toErrorMessage, updateLetter } from "@/lib/letters";
import type { Letter, LetterInput } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const MAX_NICKNAME = 30;
const MAX_CONTENT = 2000;
const MAX_MESSAGE_2027 = 300;

interface LetterModalProps {
  letter: Letter | null;
  onClose: () => void;
  onUpdated: (letter: Letter) => void;
  onDeleted: (id: string) => void;
}

interface FieldErrors {
  nickname?: string;
  content?: string;
  message2027?: string;
}

export default function LetterModal({ letter, onClose, onUpdated, onDeleted }: LetterModalProps) {
  const isOpen = letter !== null;

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [message2027, setMessage2027] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");
  const [saveError, setSaveError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function resetLocalState() {
    setIsEditing(false);
    setErrors({});
    setSaveState("idle");
    setSaveError("");
    setConfirmOpen(false);
    setIsDeleting(false);
    setDeleteError("");
  }

  function closeModal() {
    resetLocalState();
    onClose();
  }

  /**
   * 카드 내부(폼)에서 시작한 드래그가 배경 위에서 끝나 "클릭"으로 판정되는
   * 경우까지 배경 클릭으로 오인해 닫지 않도록, mousedown과 click이 모두
   * 배경 자신일 때만 닫는다.
   */
  const backdropMouseDownRef = useRef(false);

  function handleBackdropMouseDown(e: ReactMouseEvent<HTMLDivElement>) {
    backdropMouseDownRef.current = e.target === e.currentTarget;
  }

  function handleBackdropClick(e: ReactMouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && backdropMouseDownRef.current) {
      closeModal();
    }
    backdropMouseDownRef.current = false;
  }

  /** 편지 내용 등 여러 줄 textarea가 아닌 단일 줄 input에서 Enter를 누르면
   * 브라우저가 폼을 암묵적으로 제출해버려 저장 후 보기 모드로 돌아가는
   * 문제가 있었다. 저장은 반드시 [수정 완료] 버튼을 눌러야만 되도록 막는다. */
  function preventEnterSubmit(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function startEditing() {
    if (!letter) return;
    setNickname(letter.nickname);
    setContent(letter.content);
    setMessage2027(letter.message_2027);
    setIsAnonymous(letter.is_anonymous);
    setErrors({});
    setSaveState("idle");
    setSaveError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setErrors({});
    setSaveState("idle");
    setSaveError("");
  }

  function validate(): LetterInput | null {
    const next: FieldErrors = {};
    const trimmedNickname = nickname.trim();
    const trimmedContent = content.trim();
    const trimmedMessage = message2027.trim();

    if (!trimmedNickname) next.nickname = "닉네임을 입력해주세요.";
    else if (trimmedNickname.length > MAX_NICKNAME)
      next.nickname = `닉네임은 ${MAX_NICKNAME}자 이내로 입력해주세요.`;

    if (!trimmedContent) next.content = "편지 내용을 입력해주세요.";
    else if (trimmedContent.length > MAX_CONTENT)
      next.content = `편지는 ${MAX_CONTENT}자 이내로 입력해주세요.`;

    if (!trimmedMessage) next.message2027 = "2027년 워니에게 한마디를 입력해주세요.";
    else if (trimmedMessage.length > MAX_MESSAGE_2027)
      next.message2027 = `${MAX_MESSAGE_2027}자 이내로 입력해주세요.`;

    setErrors(next);
    if (Object.keys(next).length > 0) return null;

    return {
      nickname: trimmedNickname,
      content: trimmedContent,
      message_2027: trimmedMessage,
      is_anonymous: isAnonymous,
    };
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!letter) return;
    const input = validate();
    if (!input) return;

    setSaveState("saving");
    try {
      await updateLetter(letter.id, input);
      onUpdated({ ...letter, ...input });
      setIsEditing(false);
      setSaveState("idle");
    } catch (err) {
      setSaveError(toErrorMessage(err, "편지를 수정하지 못했습니다."));
      setSaveState("error");
    }
  }

  async function handleConfirmDelete() {
    if (!letter) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteLetter(letter.id);
      onDeleted(letter.id);
      resetLocalState();
    } catch {
      setIsDeleting(false);
      setDeleteError("편지를 삭제하지 못했습니다.");
    }
  }

  const from = letter?.is_anonymous ? "익명의 팬" : letter?.nickname;

  return (
    <>
      <AnimatePresence>
        {letter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onMouseDown={handleBackdropMouseDown}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto border border-white/10 bg-bg-soft px-7 py-10 sm:px-10"
            >
              <button
                type="button"
                onClick={closeModal}
                aria-label="닫기"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center text-xl text-text-soft transition-colors hover:text-pink"
              >
                ✕
              </button>

              {isEditing ? (
                <form onSubmit={handleSave} noValidate className="flex flex-col gap-6">
                  <p className="font-display text-sm tracking-[0.2em] text-star">
                    편지 수정하기
                  </p>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <label
                        htmlFor="edit-nickname"
                        className="text-xs tracking-[0.2em] text-text-soft"
                      >
                        닉네임
                      </label>
                      <span className="text-[11px] text-text-soft/60">
                        {nickname.length}/{MAX_NICKNAME}
                      </span>
                    </div>
                    <input
                      id="edit-nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      onKeyDown={preventEnterSubmit}
                      maxLength={MAX_NICKNAME}
                      className="border border-white/15 bg-bg-soft px-4 py-3 text-text outline-none transition-colors focus:border-pink"
                    />
                    {errors.nickname && (
                      <p className="text-xs text-pink">{errors.nickname}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <label
                        htmlFor="edit-content"
                        className="text-xs tracking-[0.2em] text-text-soft"
                      >
                        편지 내용
                      </label>
                      <span className="text-[11px] text-text-soft/60">
                        {content.length}/{MAX_CONTENT}
                      </span>
                    </div>
                    <textarea
                      id="edit-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={MAX_CONTENT}
                      rows={8}
                      className="font-serif-kr resize-none border border-white/15 bg-bg-soft px-4 py-3 leading-relaxed text-text outline-none transition-colors focus:border-pink"
                    />
                    {errors.content && <p className="text-xs text-pink">{errors.content}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <label
                        htmlFor="edit-message2027"
                        className="text-xs tracking-[0.2em] text-text-soft"
                      >
                        2027년 워니에게 한마디
                      </label>
                      <span className="text-[11px] text-text-soft/60">
                        {message2027.length}/{MAX_MESSAGE_2027}
                      </span>
                    </div>
                    <textarea
                      id="edit-message2027"
                      value={message2027}
                      onChange={(e) => setMessage2027(e.target.value)}
                      maxLength={MAX_MESSAGE_2027}
                      rows={3}
                      className="font-serif-kr resize-none border border-white/15 bg-bg-soft px-4 py-3 leading-relaxed text-text outline-none transition-colors focus:border-pink"
                    />
                    {errors.message2027 && (
                      <p className="text-xs text-pink">{errors.message2027}</p>
                    )}
                  </div>

                  <label className="flex items-center gap-3 text-sm text-text-soft">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 accent-pink"
                    />
                    익명으로 보내기
                  </label>

                  {saveState === "error" && (
                    <p className="border border-pink/30 bg-bg-soft px-4 py-3 text-xs text-pink/90">
                      {saveError || "편지를 수정하지 못했습니다."}
                    </p>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saveState === "saving"}
                      className="border border-white/15 px-6 py-2.5 text-xs tracking-[0.15em] text-text-soft transition-colors hover:border-text-soft/60 hover:text-text disabled:opacity-40"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={saveState === "saving"}
                      className="border border-text-soft/40 px-6 py-2.5 text-xs tracking-[0.15em] text-text transition-colors hover:border-pink hover:text-pink disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {saveState === "saving" ? "수정하는 중..." : "수정 완료"}
                    </button>
                  </div>
                </form>
              ) : (
                letter && (
                  <>
                    <p className="font-display text-sm tracking-[0.2em] text-star">Dear. WONY</p>

                    <p className="font-serif-kr mt-6 whitespace-pre-wrap text-base leading-relaxed text-text sm:text-lg">
                      {letter.content}
                    </p>

                    <p className="font-serif-kr mt-6 whitespace-pre-wrap text-base italic leading-relaxed text-pink/90">
                      {letter.message_2027}
                    </p>

                    <p className="font-serif-kr mt-8 text-right text-sm text-text-soft">
                      From. {from}
                    </p>

                    {deleteError && (
                      <p className="mt-4 text-right text-xs text-pink">{deleteError}</p>
                    )}

                    <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
                      <button
                        type="button"
                        onClick={startEditing}
                        className="border border-white/15 px-5 py-2 text-xs tracking-[0.15em] text-text-soft transition-colors hover:border-text-soft/60 hover:text-text"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmOpen(true)}
                        className="border border-pink/30 px-5 py-2 text-xs tracking-[0.15em] text-pink/80 transition-colors hover:border-pink hover:text-pink"
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        message="정말 이 편지를 삭제하시겠습니까?"
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
