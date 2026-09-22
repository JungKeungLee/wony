"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { deleteLetter, toErrorMessage, updateLetter } from "@/lib/letters";
import type { Letter, LetterInput } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useSiteMode } from "@/context/SiteModeContext";

const MAX_NICKNAME = 30;
const MAX_CONTENT = 2000;
const MAX_MESSAGE_2027 = 300;

/** 봉투 열림 연출의 각 단계 지연/길이(초). flap -> 편지지 -> 내용 순서로 살짝씩
 * 겹치며 이어져 전체가 대략 1초 안팎에 끝난다. 닫을 때는 반대 순서로, 훨씬
 * 짧고 빠르게 접힌다. */
const FLAP_OPEN_DELAY = 0.25;
const FLAP_OPEN_DURATION = 0.35;
const FLAP_CLOSE_DELAY = 0.18;
const FLAP_CLOSE_DURATION = 0.28;
const PAPER_OPEN_DELAY = 0.5;
const PAPER_OPEN_DURATION = 0.4;
const PAPER_CLOSE_DELAY = 0.08;
const PAPER_CLOSE_DURATION = 0.25;
const CONTENT_OPEN_DELAY = 0.7;
const CONTENT_OPEN_DURATION = 0.3;
const CONTENT_CLOSE_DURATION = 0.15;
/** 열리는 순간 잠깐 반짝이는 별빛이 보이는 시간(ms). */
const OPEN_SPARK_VISIBLE_MS = 700;

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
  const { isContributeMode } = useSiteMode();
  const prefersReducedMotion = useReducedMotion();

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

  const [showOpenSparks, setShowOpenSparks] = useState(false);
  const [prevLetterId, setPrevLetterId] = useState<string | null>(null);

  // 편지가 바뀔 때(새로 열릴 때)만 반짝임을 켠다 - effect 안에서 곧바로
  // setState하는 대신, 렌더 도중 이전 값과 비교해 갱신하는 React의 표준
  // "prop이 바뀌면 상태를 조정" 패턴을 사용한다(ref 대신 state로 이전 값을 기억).
  if (letter && letter.id !== prevLetterId) {
    setPrevLetterId(letter.id);
    setShowOpenSparks(true);
  }

  useEffect(() => {
    if (!showOpenSparks) return;
    const timer = window.setTimeout(() => setShowOpenSparks(false), OPEN_SPARK_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [showOpenSparks]);

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

  // 봉투 flap이 열리는 각도(transformOrigin: top 기준) - 과한 3D 느낌이 나지
  // 않도록 일부러 작은 값만 사용한다.
  const flapVariants = prefersReducedMotion
    ? {
        initial: { rotateX: -34 },
        animate: { rotateX: -34, transition: { duration: 0 } },
        exit: { rotateX: -34, transition: { duration: 0 } },
      }
    : {
        initial: { rotateX: 0 },
        animate: {
          rotateX: -34,
          transition: { duration: FLAP_OPEN_DURATION, delay: FLAP_OPEN_DELAY, ease: "easeInOut" as const },
        },
        exit: {
          rotateX: 0,
          transition: { duration: FLAP_CLOSE_DURATION, delay: FLAP_CLOSE_DELAY, ease: "easeInOut" as const },
        },
      };

  const paperVariants = prefersReducedMotion
    ? {
        initial: { opacity: 1, y: 0, scaleY: 1 },
        animate: { opacity: 1, y: 0, scaleY: 1, transition: { duration: 0.25 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        initial: { opacity: 0, y: 30, scaleY: 0.92 },
        animate: {
          opacity: 1,
          y: -6,
          scaleY: 1,
          transition: { duration: PAPER_OPEN_DURATION, delay: PAPER_OPEN_DELAY, ease: "easeOut" as const },
        },
        exit: {
          opacity: 0,
          y: 18,
          scaleY: 0.94,
          transition: { duration: PAPER_CLOSE_DURATION, delay: PAPER_CLOSE_DELAY, ease: "easeIn" as const },
        },
      };

  const contentVariants = prefersReducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: { duration: CONTENT_OPEN_DURATION, delay: CONTENT_OPEN_DELAY, ease: "easeOut" as const },
        },
        exit: { opacity: 0, transition: { duration: CONTENT_CLOSE_DURATION } },
      };

  return (
    <>
      <AnimatePresence>
        {letter && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onMouseDown={handleBackdropMouseDown}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
          >
            {/* 봉투 전체 - LetterCard와 같은 layoutId를 공유해, 카드가 있던 자리에서
                화면 중앙까지 자연스럽게 이어지는 shared layout 애니메이션을 만든다. */}
            <motion.div
              layoutId={prefersReducedMotion ? undefined : `letter-envelope-${letter.id}`}
              transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
              onClick={(e) => e.stopPropagation()}
              style={{ perspective: 800 }}
              className="relative w-[92vw] max-w-md sm:max-w-lg"
            >
              <div className="relative overflow-hidden rounded-sm border border-[#cbb383]/60 bg-[#efe1c3] shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
                {/* 봉투 flap - transformOrigin: top, subtle rotateX */}
                <motion.div
                  aria-hidden
                  variants={flapVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ transformOrigin: "top center" }}
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[64px] border-b border-[#c7ad79]/70 bg-gradient-to-b from-[#e8d7ac] to-[#dcc696] sm:h-[78px]"
                />

                {/* 열리는 순간 잠깐 반짝이는 작은 별빛 1~2개 - 무거운 파티클 없이 살짝만. */}
                <AnimatePresence>
                  {showOpenSparks && !prefersReducedMotion && (
                    <>
                      <motion.span
                        key="modal-spark-1"
                        aria-hidden
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: 1, y: -8 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
                        className="pointer-events-none absolute left-8 top-6 z-20 text-xs text-[#c79a3f]"
                      >
                        ✦
                      </motion.span>
                      <motion.span
                        key="modal-spark-2"
                        aria-hidden
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: 1, y: -6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, delay: 0.68, ease: "easeOut" }}
                        className="pointer-events-none absolute right-10 top-9 z-20 text-[10px] text-[#c79a3f]/80"
                      >
                        ✦
                      </motion.span>
                    </>
                  )}
                </AnimatePresence>

                {/* 닫기 버튼 - 편지지가 길어 내부가 스크롤되어도 항상 같은 자리에서 눌러 닫을 수 있게
                    스크롤 영역 밖(봉투 자체)에 둔다. */}
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="닫기"
                  className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center text-xl text-[#6b5a3f] transition-colors hover:text-[#a85a6b]"
                >
                  ✕
                </button>

                <div className="relative z-20 px-1 pb-1 pt-[58px] sm:pt-[72px]">
                  {/* 편지지 - 봉투 안에서 밀려 올라오며 펼쳐지는 느낌(translateY + scaleY). 긴
                      편지는 이 영역만 내부 스크롤된다. */}
                  <motion.div
                    variants={paperVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ transformOrigin: "top" }}
                    className="max-h-[75vh] overflow-y-auto rounded-[2px] border border-[#e2d3ab] bg-[#faf4e6] px-6 py-8 shadow-[inset_0_6px_14px_rgba(0,0,0,0.06)] sm:max-h-[73vh] sm:px-9 sm:py-9"
                  >
                    <motion.div variants={contentVariants} initial="initial" animate="animate" exit="exit">
                      {isEditing ? (
                        <form onSubmit={handleSave} noValidate className="flex flex-col gap-6">
                          <p className="font-display text-sm tracking-[0.2em] text-[#a67c2e]">
                            편지 수정하기
                          </p>

                          <div className="flex flex-col gap-2">
                            <div className="flex items-baseline justify-between">
                              <label
                                htmlFor="edit-nickname"
                                className="text-xs tracking-[0.2em] text-[#8a7455]"
                              >
                                닉네임
                              </label>
                              <span className="text-[11px] text-[#8a7455]/70">
                                {nickname.length}/{MAX_NICKNAME}
                              </span>
                            </div>
                            <input
                              id="edit-nickname"
                              value={nickname}
                              onChange={(e) => setNickname(e.target.value)}
                              onKeyDown={preventEnterSubmit}
                              maxLength={MAX_NICKNAME}
                              className="border border-[#cbb383] bg-[#faf4e6] px-4 py-3 text-[#3e2f1f] outline-none transition-colors focus:border-[#a85a6b]"
                            />
                            {errors.nickname && (
                              <p className="text-xs text-[#a85a6b]">{errors.nickname}</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex items-baseline justify-between">
                              <label
                                htmlFor="edit-content"
                                className="text-xs tracking-[0.2em] text-[#8a7455]"
                              >
                                편지 내용
                              </label>
                              <span className="text-[11px] text-[#8a7455]/70">
                                {content.length}/{MAX_CONTENT}
                              </span>
                            </div>
                            <textarea
                              id="edit-content"
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              maxLength={MAX_CONTENT}
                              rows={8}
                              className="font-serif-kr resize-none border border-[#cbb383] bg-[#faf4e6] px-4 py-3 leading-relaxed text-[#3e2f1f] outline-none transition-colors focus:border-[#a85a6b]"
                            />
                            {errors.content && <p className="text-xs text-[#a85a6b]">{errors.content}</p>}
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex items-baseline justify-between">
                              <label
                                htmlFor="edit-message2027"
                                className="text-xs tracking-[0.2em] text-[#8a7455]"
                              >
                                2027년 워니에게 한마디
                              </label>
                              <span className="text-[11px] text-[#8a7455]/70">
                                {message2027.length}/{MAX_MESSAGE_2027}
                              </span>
                            </div>
                            <textarea
                              id="edit-message2027"
                              value={message2027}
                              onChange={(e) => setMessage2027(e.target.value)}
                              maxLength={MAX_MESSAGE_2027}
                              rows={3}
                              className="font-serif-kr resize-none border border-[#cbb383] bg-[#faf4e6] px-4 py-3 leading-relaxed text-[#3e2f1f] outline-none transition-colors focus:border-[#a85a6b]"
                            />
                            {errors.message2027 && (
                              <p className="text-xs text-[#a85a6b]">{errors.message2027}</p>
                            )}
                          </div>

                          <label className="flex items-center gap-3 text-sm text-[#8a7455]">
                            <input
                              type="checkbox"
                              checked={isAnonymous}
                              onChange={(e) => setIsAnonymous(e.target.checked)}
                              className="h-4 w-4 accent-[#a85a6b]"
                            />
                            익명으로 보내기
                          </label>

                          {saveState === "error" && (
                            <p className="border border-[#a85a6b]/30 bg-[#faf4e6] px-4 py-3 text-xs text-[#a85a6b]">
                              {saveError || "편지를 수정하지 못했습니다."}
                            </p>
                          )}

                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={saveState === "saving"}
                              className="border border-[#cbb383] px-6 py-2.5 text-xs tracking-[0.15em] text-[#8a7455] transition-colors hover:border-[#6b5a3f] hover:text-[#3e2f1f] disabled:opacity-40"
                            >
                              취소
                            </button>
                            <button
                              type="submit"
                              disabled={saveState === "saving"}
                              className="border border-[#6b5a3f]/50 px-6 py-2.5 text-xs tracking-[0.15em] text-[#3e2f1f] transition-colors hover:border-[#a85a6b] hover:text-[#a85a6b] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {saveState === "saving" ? "수정하는 중..." : "수정 완료"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        letter && (
                          <div>
                            <p className="font-display text-sm tracking-[0.2em] text-[#a67c2e]">Dear. WONY</p>

                            <p className="font-serif-kr mt-6 whitespace-pre-wrap text-base leading-relaxed text-[#3e2f1f] sm:text-lg">
                              {letter.content}
                            </p>

                            <p className="font-serif-kr mt-6 whitespace-pre-wrap text-base italic leading-relaxed text-[#a85a6b]">
                              {letter.message_2027}
                            </p>

                            <p className="font-serif-kr mt-8 text-right text-sm text-[#8a7455]">
                              From. {from}
                            </p>

                            {deleteError && (
                              <p className="mt-4 text-right text-xs text-[#a85a6b]">{deleteError}</p>
                            )}

                            <div className="mt-6 flex justify-end gap-3 border-t border-[#cbb383]/50 pt-5">
                              <button
                                type="button"
                                onClick={startEditing}
                                className="border border-[#cbb383] px-5 py-2 text-xs tracking-[0.15em] text-[#8a7455] transition-colors hover:border-[#6b5a3f] hover:text-[#3e2f1f]"
                              >
                                수정
                              </button>
                              {/* 운영 테스트 전용 구분: 삭제는 관리자 화면에서만 보인다. */}
                              {!isContributeMode && (
                                <button
                                  type="button"
                                  onClick={() => setConfirmOpen(true)}
                                  className="border border-[#a85a6b]/40 px-5 py-2 text-xs tracking-[0.15em] text-[#a85a6b]/90 transition-colors hover:border-[#a85a6b] hover:text-[#a85a6b]"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
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
