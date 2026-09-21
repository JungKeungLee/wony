"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { ArchiveItem, ArchiveMonth } from "@/data/archive";
import type { ArchiveComment, ArchiveEntryInput, ArchiveEntryRow, ArchiveImage } from "@/lib/types";
import {
  deleteArchiveImage,
  fetchArchiveImages,
  replaceArchiveImage,
  uploadArchiveImage,
} from "@/lib/archiveImages";
import {
  createArchiveComment,
  deleteArchiveComment,
  fetchArchiveComments,
  updateArchiveComment,
} from "@/lib/archiveComments";
import {
  archiveEntryToItem,
  createArchiveEntry,
  deleteArchiveEntry,
  fetchArchiveEntries,
  updateArchiveEntry,
} from "@/lib/archiveEntries";
import { parseArchiveMonth, parseArchiveSortKey } from "@/lib/archiveDate";
import { toErrorMessage } from "@/lib/letters";
import { prepareThumbnailForUpload, validateImageFile } from "@/lib/imageProcessing";
import ArchiveMonthSection from "./ArchiveMonthSection";
import ArchiveImageModal from "./ArchiveImageModal";
import ArchiveEntryForm from "./ArchiveEntryForm";
import StatusToast from "@/components/ui/StatusToast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const MONTH_LABELS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

type EntryFormState = null | { mode: "create" } | { mode: "edit"; archiveId: string; initial: ArchiveEntryInput };

export default function ArchiveContent() {
  const [entries, setEntries] = useState<ArchiveEntryRow[]>([]);
  const [entriesStatus, setEntriesStatus] = useState<"loading" | "success" | "error">("loading");
  const [images, setImages] = useState<Map<string, ArchiveImage>>(new Map());
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [viewingArchiveId, setViewingArchiveId] = useState<string | null>(null);
  const [comments, setComments] = useState<Map<string, ArchiveComment>>(new Map());
  const [entryForm, setEntryForm] = useState<EntryFormState>(null);
  const [confirmDeleteEntryId, setConfirmDeleteEntryId] = useState<string | null>(null);
  const [isDeletingEntry, setIsDeletingEntry] = useState(false);
  const [deleteEntryError, setDeleteEntryError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<{ archiveId: string; month: number } | null>(null);

  // ARCHIVE 기본 데이터(날짜/메인주제/서브주제/해시태그)를 archive_entries에서 불러와
  // 1~12월이 항상 존재하는 구조로 묶는다. 데이터가 없는 달도 섹션은 그대로 보여준다.
  const months: ArchiveMonth[] = useMemo(() => {
    const grouped = new Map<number, ArchiveItem[]>();
    for (const entry of entries) {
      const month = parseArchiveMonth(entry.date);
      const list = grouped.get(month) ?? [];
      list.push(archiveEntryToItem(entry));
      grouped.set(month, list);
    }
    for (const list of grouped.values()) {
      list.sort((a, b) => parseArchiveSortKey(a.date) - parseArchiveSortKey(b.date));
    }
    return MONTH_LABELS.map((monthLabel, i) => {
      const month = i + 1;
      return { month, monthLabel, items: grouped.get(month) ?? [] };
    });
  }, [entries]);

  const archiveIdToMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const monthData of months) {
      for (const item of monthData.items) {
        map.set(item.id, monthData.month);
      }
    }
    return map;
  }, [months]);

  useEffect(() => {
    let cancelled = false;

    fetchArchiveEntries()
      .then((rows) => {
        if (cancelled) return;
        setEntries(rows);
        setEntriesStatus("success");
      })
      .catch(() => {
        if (!cancelled) setEntriesStatus("error");
      });

    fetchArchiveImages()
      .then((map) => {
        if (!cancelled) setImages(map);
      })
      .catch(() => {
        // 대표 이미지 조회 실패는 방송 기록 열람 자체를 막을 정도는 아니므로 조용히
        // 무시하고, 각 기록은 그냥 "사진 추가" 상태로 보인다.
      });

    fetchArchiveComments()
      .then((map) => {
        if (!cancelled) setComments(map);
      })
      .catch(() => {
        // 코멘트 조회 실패도 마찬가지로 조용히 무시하고, 각 기록은 그냥
        // "코멘트 추가" 상태로 보인다.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function requestPhoto(archiveId: string) {
    const month = archiveIdToMonth.get(archiveId);
    if (!month) return;
    pendingRef.current = { archiveId, month };
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const pending = pendingRef.current;
    e.target.value = "";
    pendingRef.current = null;
    if (!file || !pending) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setStatusMessage(validationError);
      return;
    }

    const { archiveId, month } = pending;
    const existing = images.get(archiveId);

    setUploadingId(archiveId);
    try {
      const blob = await prepareThumbnailForUpload(file);
      const saved = existing
        ? await replaceArchiveImage({ existing, month, image: blob })
        : await uploadArchiveImage({ archiveId, month, image: blob });

      setImages((prev) => {
        const next = new Map(prev);
        next.set(archiveId, saved);
        return next;
      });
      setStatusMessage(
        existing ? "대표 이미지가 변경되었습니다." : "대표 이미지가 등록되었습니다."
      );
    } catch (err) {
      setStatusMessage(toErrorMessage(err, "이미지를 등록하지 못했습니다."));
    } finally {
      setUploadingId(null);
    }
  }

  async function handleDeleteImage(archiveId: string): Promise<void> {
    const existing = images.get(archiveId);
    if (!existing) return;

    await deleteArchiveImage(existing);

    setImages((prev) => {
      const next = new Map(prev);
      next.delete(archiveId);
      return next;
    });
    setStatusMessage("대표 이미지가 삭제되었습니다.");
    setViewingArchiveId(null);
  }

  /** 저장 성공 시 반환된 행으로 Map만 갱신한다 - 새로고침이나 refetch 없이 해당
   * archive_id의 카드만 즉시 다시 그려지고, 스크롤 위치도 그대로 유지된다. */
  async function handleSaveComment(archiveId: string, text: string): Promise<void> {
    const existing = comments.get(archiveId);
    const saved = existing
      ? await updateArchiveComment(archiveId, text)
      : await createArchiveComment(archiveId, text);

    setComments((prev) => {
      const next = new Map(prev);
      next.set(archiveId, saved);
      return next;
    });
  }

  async function handleDeleteComment(archiveId: string): Promise<void> {
    await deleteArchiveComment(archiveId);

    setComments((prev) => {
      const next = new Map(prev);
      next.delete(archiveId);
      return next;
    });
  }

  // ---- 기록(날짜/메인주제/서브주제/해시태그) 등록/수정/삭제 ----

  async function handleEntrySubmit(input: ArchiveEntryInput): Promise<void> {
    if (entryForm?.mode === "edit") {
      const archiveId = entryForm.archiveId;
      const saved = await updateArchiveEntry(archiveId, input);
      setEntries((prev) => prev.map((e) => (e.archive_id === archiveId ? saved : e)));
      setStatusMessage("기록이 수정되었습니다.");
    } else {
      const saved = await createArchiveEntry(input);
      setEntries((prev) => [...prev, saved]);
      setStatusMessage("기록이 등록되었습니다.");
    }
  }

  function openCreateEntry() {
    setEntryForm({ mode: "create" });
  }

  function openEditEntry(archiveId: string) {
    const entry = entries.find((e) => e.archive_id === archiveId);
    if (!entry) return;
    setEntryForm({
      mode: "edit",
      archiveId,
      initial: {
        date: entry.date,
        title: entry.title,
        description: entry.description,
        tags: entry.tags,
      },
    });
  }

  async function handleConfirmDeleteEntry() {
    if (!confirmDeleteEntryId) return;
    const archiveId = confirmDeleteEntryId;
    setIsDeletingEntry(true);
    setDeleteEntryError("");
    try {
      await deleteArchiveEntry(archiveId);
      setEntries((prev) => prev.filter((e) => e.archive_id !== archiveId));
      setConfirmDeleteEntryId(null);
      setStatusMessage("기록이 삭제되었습니다.");
    } catch (err) {
      setDeleteEntryError(toErrorMessage(err, "기록을 삭제하지 못했습니다."));
    } finally {
      setIsDeletingEntry(false);
    }
  }

  const viewingImage = viewingArchiveId ? (images.get(viewingArchiveId) ?? null) : null;

  const deletingHasLinkedData =
    confirmDeleteEntryId !== null &&
    (images.has(confirmDeleteEntryId) || comments.has(confirmDeleteEntryId));
  const deleteEntryMessage = deletingHasLinkedData
    ? "이 Archive 기록을 삭제하시겠습니까?\n\n메인주제, 서브주제, 해시태그가 목록에서 제거됩니다.\n\n이 기록에는 대표 이미지 또는 MEMORY NOTE가 연결되어 있습니다."
    : "이 Archive 기록을 삭제하시겠습니까?\n\n메인주제, 서브주제, 해시태그가 목록에서 제거됩니다.";

  return (
    <>
      {/* display:none 대신 sr-only를 써서, OS 파일 선택창이 닫힌 뒤 브라우저가 포커스를
          이 input으로 되돌리려다 실패해 다른 곳으로 튀는 것을 방지한다. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
      />

      <div className="mx-auto flex max-w-[1000px] justify-end px-6 pt-2">
        <button
          type="button"
          onClick={openCreateEntry}
          className="border border-white/15 px-4 py-2 text-[11px] tracking-[0.15em] text-text-soft/70 transition-colors hover:border-star hover:text-star"
        >
          [ + 기록 추가 ]
        </button>
      </div>

      {entriesStatus === "loading" && (
        <div className="flex flex-col items-center gap-4 py-24 text-text-soft">
          <span className="animate-pulse text-2xl text-star">✦</span>
          <p className="text-sm tracking-[0.2em]">기록을 불러오는 중...</p>
        </div>
      )}

      {entriesStatus === "error" && (
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <p className="font-serif-kr text-text-soft">기록을 불러오지 못했습니다.</p>
        </div>
      )}

      {entriesStatus === "success" &&
        months.map((monthData, i) => (
          <ArchiveMonthSection
            key={monthData.month}
            {...monthData}
            isFirst={i === 0}
            images={images}
            uploadingId={uploadingId}
            comments={comments}
            onAddPhoto={requestPhoto}
            onOpenPhoto={setViewingArchiveId}
            onSaveComment={handleSaveComment}
            onDeleteComment={handleDeleteComment}
            onEditEntry={openEditEntry}
            onDeleteEntry={setConfirmDeleteEntryId}
          />
        ))}

      <ArchiveImageModal
        archiveId={viewingArchiveId}
        image={viewingImage}
        onClose={() => setViewingArchiveId(null)}
        onReplace={requestPhoto}
        onDelete={handleDeleteImage}
      />

      <ArchiveEntryForm state={entryForm} onSubmit={handleEntrySubmit} onClose={() => setEntryForm(null)} />

      <ConfirmDialog
        open={confirmDeleteEntryId !== null}
        message={deleteEntryMessage}
        isProcessing={isDeletingEntry}
        onConfirm={handleConfirmDeleteEntry}
        onCancel={() => {
          setConfirmDeleteEntryId(null);
          setDeleteEntryError("");
        }}
      />
      {deleteEntryError && (
        <p className="mx-auto max-w-xs px-6 pt-2 text-center text-xs text-pink">{deleteEntryError}</p>
      )}

      <StatusToast message={statusMessage} onDismiss={() => setStatusMessage(null)} />
    </>
  );
}
