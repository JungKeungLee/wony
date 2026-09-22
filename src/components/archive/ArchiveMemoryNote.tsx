"use client";

import { useState, type FormEvent } from "react";
import { toErrorMessage } from "@/lib/letters";
import type { ArchiveComment } from "@/lib/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useSiteMode } from "@/context/SiteModeContext";

const MAX_COMMENT = 1000;

interface ArchiveMemoryNoteProps {
  comment: ArchiveComment | undefined;
  onSave: (text: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

/** Archive 각 항목 하단에 붙는 "✦ 그날의 기록 / MEMORY NOTE" - 코멘트 1개를 보고/추가/수정/삭제한다. */
export default function ArchiveMemoryNote({ comment, onSave, onDelete }: ArchiveMemoryNoteProps) {
  const { isContributeMode } = useSiteMode();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function startEditing() {
    setText(comment?.comment ?? "");
    setSaveState("idle");
    setSaveError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setSaveState("idle");
    setSaveError("");
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setSaveError("코멘트 내용을 입력해주세요.");
      setSaveState("error");
      return;
    }
    if (trimmed.length > MAX_COMMENT) {
      setSaveError(`코멘트는 ${MAX_COMMENT}자 이내로 입력해주세요.`);
      setSaveState("error");
      return;
    }

    setSaveState("saving");
    try {
      await onSave(trimmed);
      setIsEditing(false);
      setSaveState("idle");
    } catch (err) {
      setSaveError(toErrorMessage(err, "코멘트를 저장하지 못했습니다."));
      setSaveState("error");
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await onDelete();
      setConfirmOpen(false);
      setIsDeleting(false);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(toErrorMessage(err, "코멘트를 삭제하지 못했습니다."));
    }
  }

  return (
    <div className="mt-2 border-t border-white/10 pt-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] tracking-[0.15em] text-star/80">
        <span aria-hidden>✦</span>
        <span>그날의 기록 / MEMORY NOTE</span>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_COMMENT}
            rows={3}
            autoFocus
            placeholder="이 방송에 대한 짧은 기록을 남겨주세요."
            className="font-serif-kr resize-none border border-white/15 bg-bg px-3 py-2 text-sm leading-relaxed text-text outline-none transition-colors focus:border-star"
          />
          {saveState === "error" && <p className="text-xs text-pink">{saveError}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saveState === "saving"}
              className="border border-white/15 px-4 py-1.5 text-[11px] tracking-[0.1em] text-text-soft transition-colors hover:border-text-soft/60 hover:text-text disabled:opacity-40"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saveState === "saving"}
              className="border border-text-soft/40 px-4 py-1.5 text-[11px] tracking-[0.1em] text-text transition-colors hover:border-star hover:text-star disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saveState === "saving" ? "저장하는 중..." : "저장"}
            </button>
          </div>
        </form>
      ) : comment ? (
        <div className="flex flex-col gap-2">
          <p className="font-serif-kr whitespace-pre-wrap text-sm leading-relaxed text-text-soft">
            {comment.comment}
          </p>
          {deleteError && <p className="text-xs text-pink">{deleteError}</p>}
          <div className="flex gap-3 text-[11px] tracking-[0.1em] text-text-soft/70">
            <button type="button" onClick={startEditing} className="transition-colors hover:text-star">
              [ 수정 ]
            </button>
            {/* 운영 테스트 전용 구분: 삭제는 관리자 화면에서만 보인다. */}
            {!isContributeMode && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="transition-colors hover:text-pink"
              >
                [ 삭제 ]
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="text-[11px] tracking-[0.1em] text-text-soft/70 transition-colors hover:text-star"
        >
          [ 코멘트 추가 ]
        </button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        message="이 기록을 정말 삭제하시겠습니까?"
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
