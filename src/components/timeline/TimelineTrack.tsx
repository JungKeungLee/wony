"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { TimelineMonthData, TimelineImageRow } from "@/lib/types";
import {
  deleteTimelineImage,
  deleteTimelineSmallImage,
  fetchTimelineImages,
  fetchTimelineSmallImages,
  replaceTimelineImage,
  uploadTimelineImage,
  uploadTimelineSmallImage,
} from "@/lib/timelineImages";
import { toErrorMessage } from "@/lib/letters";
import { prepareThumbnailForUpload, validateImageFile } from "@/lib/imageProcessing";
import TimelineMonth from "./TimelineMonth";
import ImageModal, { type ImageModalState } from "./ImageModal";
import StatusToast from "@/components/ui/StatusToast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import HiddenStar from "@/components/effects/HiddenStar";

/** Timeline 대표 이미지는 4:3 카드 비율에 맞춘다 (Archive/작은 이미지의 16:9와 다름). */
const COVER_THUMBNAIL_OPTIONS = { width: 640, height: 480 };

interface TimelineModalState extends ImageModalState {
  month: number;
}

type PendingUpload =
  | { kind: "cover"; month: number }
  | { kind: "small"; month: number; sortOrder: number };

export default function TimelineTrack({ months }: { months: TimelineMonthData[] }) {
  const [modal, setModal] = useState<TimelineModalState | null>(null);
  const [coverImages, setCoverImages] = useState<Map<number, TimelineImageRow>>(new Map());
  const [smallImages, setSmallImages] = useState<Map<number, TimelineImageRow[]>>(new Map());
  const [uploadingMonth, setUploadingMonth] = useState<number | null>(null);
  const [uploadingSmallSlot, setUploadingSmallSlot] = useState<{ month: number; sortOrder: number } | null>(
    null
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [confirmDeleteMonth, setConfirmDeleteMonth] = useState<number | null>(null);
  const [isDeletingCover, setIsDeletingCover] = useState(false);
  const [confirmDeleteSmallImage, setConfirmDeleteSmallImage] = useState<TimelineImageRow | null>(null);
  const [isDeletingSmallImage, setIsDeletingSmallImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadRef = useRef<PendingUpload | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchTimelineImages()
      .then((map) => {
        if (!cancelled) setCoverImages(map);
      })
      .catch(() => {
        // 대표 이미지 조회 실패는 Timeline 열람 자체를 막을 정도는 아니므로 조용히
        // 무시하고, 각 월은 그냥 기존 Placeholder(+ 사진 추가 버튼)로 보인다.
      });

    fetchTimelineSmallImages()
      .then((map) => {
        if (!cancelled) setSmallImages(map);
      })
      .catch(() => {
        // 마찬가지로 조용히 무시하고 각 슬롯은 [ + 사진 추가 ] 상태로 보인다.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function requestCoverPhoto(month: number) {
    pendingUploadRef.current = { kind: "cover", month };
    fileInputRef.current?.click();
  }

  function requestSmallPhoto(month: number, sortOrder: number) {
    pendingUploadRef.current = { kind: "small", month, sortOrder };
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const pending = pendingUploadRef.current;
    e.target.value = "";
    pendingUploadRef.current = null;
    if (!file || !pending) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setStatusMessage(validationError);
      return;
    }

    if (pending.kind === "cover") {
      const { month } = pending;
      const existing = coverImages.get(month);
      setUploadingMonth(month);
      try {
        const blob = await prepareThumbnailForUpload(file, COVER_THUMBNAIL_OPTIONS);
        const saved = existing
          ? await replaceTimelineImage({ existing, image: blob })
          : await uploadTimelineImage({ month, image: blob });
        setCoverImages((prev) => {
          const next = new Map(prev);
          next.set(month, saved);
          return next;
        });
        setStatusMessage(existing ? "대표 이미지가 변경되었습니다." : "대표 이미지가 등록되었습니다.");
      } catch (err) {
        setStatusMessage(
          toErrorMessage(err, existing ? "이미지를 변경하지 못했습니다." : "이미지를 등록하지 못했습니다.")
        );
      } finally {
        setUploadingMonth(null);
      }
      return;
    }

    const { month, sortOrder } = pending;
    setUploadingSmallSlot({ month, sortOrder });
    try {
      const blob = await prepareThumbnailForUpload(file);
      const saved = await uploadTimelineSmallImage({ month, sortOrder, image: blob });
      setSmallImages((prev) => {
        const next = new Map(prev);
        const list = [...(next.get(month) ?? []), saved].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
        next.set(month, list);
        return next;
      });
      setStatusMessage("이미지가 등록되었습니다.");
    } catch (err) {
      setStatusMessage(toErrorMessage(err, "이미지를 등록하지 못했습니다."));
    } finally {
      setUploadingSmallSlot(null);
    }
  }

  async function handleConfirmDeleteCover() {
    if (confirmDeleteMonth === null) return;
    const existing = coverImages.get(confirmDeleteMonth);
    if (!existing) {
      setConfirmDeleteMonth(null);
      return;
    }

    setIsDeletingCover(true);
    try {
      await deleteTimelineImage(existing);
      setCoverImages((prev) => {
        const next = new Map(prev);
        next.delete(confirmDeleteMonth);
        return next;
      });
      setStatusMessage("대표 이미지가 삭제되었습니다.");
    } catch (err) {
      setStatusMessage(toErrorMessage(err, "이미지를 삭제하지 못했습니다."));
    } finally {
      setIsDeletingCover(false);
      setConfirmDeleteMonth(null);
    }
  }

  function handleDeleteImageFromModal(index: number) {
    if (!modal) return;
    const row = (smallImages.get(modal.month) ?? [])[index - 1];
    if (!row) return;
    setConfirmDeleteSmallImage(row);
  }

  async function handleConfirmDeleteSmallImage() {
    if (!confirmDeleteSmallImage) return;
    const target = confirmDeleteSmallImage;

    setIsDeletingSmallImage(true);
    try {
      await deleteTimelineSmallImage(target);
      setSmallImages((prev) => {
        const next = new Map(prev);
        const list = (next.get(target.month) ?? []).filter((img) => img.id !== target.id);
        next.set(target.month, list);
        return next;
      });
      setStatusMessage("이미지가 삭제되었습니다.");
      setModal(null);
    } catch (err) {
      setStatusMessage(toErrorMessage(err, "이미지를 삭제하지 못했습니다."));
    } finally {
      setIsDeletingSmallImage(false);
      setConfirmDeleteSmallImage(null);
    }
  }

  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-32">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.16)_6%,rgba(255,255,255,0.16)_94%,transparent_100%)] md:block"
      />

      <HiddenStar
        id="timeline"
        variant="timeline-line"
        className="absolute left-1/2 top-[38%] -translate-x-1/2"
      />

      <div className="flex flex-col gap-20 md:gap-28">
        {months.map((data, i) => (
          <TimelineMonth
            key={data.month}
            data={data}
            isFirst={i === 0}
            align={i % 2 === 0 ? "left" : "right"}
            coverImage={coverImages.get(data.month)}
            isUploadingCover={uploadingMonth === data.month}
            onAddCoverPhoto={() => requestCoverPhoto(data.month)}
            onDeleteCoverPhoto={() => setConfirmDeleteMonth(data.month)}
            smallImages={smallImages.get(data.month) ?? []}
            uploadingSmallSlot={
              uploadingSmallSlot?.month === data.month ? uploadingSmallSlot.sortOrder : null
            }
            onAddSmallPhoto={(sortOrder) => requestSmallPhoto(data.month, sortOrder)}
            onOpenImage={(images, index, alt) => setModal({ images, index, alt, month: data.month })}
          />
        ))}
      </div>

      <ImageModal
        state={modal}
        onClose={() => setModal(null)}
        onNavigate={(index) => setModal((prev) => (prev ? { ...prev, index } : prev))}
        onDeleteImage={handleDeleteImageFromModal}
        nonDeletableIndex={0}
      />

      <ConfirmDialog
        open={confirmDeleteMonth !== null}
        message="이 이미지를 정말 삭제하시겠습니까?"
        isProcessing={isDeletingCover}
        onConfirm={handleConfirmDeleteCover}
        onCancel={() => setConfirmDeleteMonth(null)}
      />

      <ConfirmDialog
        open={confirmDeleteSmallImage !== null}
        message="이 이미지를 정말 삭제하시겠습니까?"
        isProcessing={isDeletingSmallImage}
        onConfirm={handleConfirmDeleteSmallImage}
        onCancel={() => setConfirmDeleteSmallImage(null)}
      />

      <StatusToast message={statusMessage} onDismiss={() => setStatusMessage(null)} />
    </section>
  );
}
