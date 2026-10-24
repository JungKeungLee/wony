"use client";

import { Fragment, useEffect, useRef, useState, type ChangeEvent } from "react";
import type { TimelineMonthData, TimelineImageRow } from "@/lib/types";
import {
  deleteTimelineImage,
  deleteTimelineSmallImage,
  fetchTimelineImages,
  fetchTimelineSmallImages,
  getSmallImageSlots,
  getVisibleSmallImages,
  replaceTimelineImage,
  TimelineSlotOccupiedError,
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
import ChapterNote from "@/components/narrative/ChapterNote";

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
  // state 반영 전에 버튼이 연달아 눌려도 두 번째 업로드가 시작되지 않도록 즉시 잠그는 ref.
  const isUploadInFlightRef = useRef(false);

  // 업로드/삭제가 진행 중이면 다른 칸에 새 요청을 받지 않는다(중복 요청 방지).
  const isTimelineBusy =
    uploadingSmallSlot !== null || uploadingMonth !== null || isDeletingSmallImage || isDeletingCover;

  /** 작은 이미지 목록을 DB 기준으로 다시 불러온다(중복 칸 오류 등으로 화면과 DB가 어긋났을 때). */
  function reloadSmallImages() {
    fetchTimelineSmallImages()
      .then(setSmallImages)
      .catch(() => {
        // 다시 불러오기 실패는 조용히 무시한다 - 화면은 직전 상태로 남는다.
      });
  }

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
    if (isTimelineBusy || isUploadInFlightRef.current) return;
    pendingUploadRef.current = { kind: "cover", month };
    fileInputRef.current?.click();
  }

  function requestSmallPhoto(month: number, sortOrder: number) {
    if (isTimelineBusy || isUploadInFlightRef.current) return;
    // 화면 기준으로도 그 칸(sort_order)이 실제로 비어 있을 때만 등록을 시작한다.
    if (getSmallImageSlots(smallImages.get(month) ?? [])[sortOrder - 1]) {
      setStatusMessage(new TimelineSlotOccupiedError().message);
      reloadSmallImages();
      return;
    }
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

    if (isUploadInFlightRef.current) return;
    isUploadInFlightRef.current = true;
    try {
      await runUpload(pending, file);
    } finally {
      isUploadInFlightRef.current = false;
    }
  }

  async function runUpload(pending: PendingUpload, file: File) {
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
      // 이미 사진이 있는 칸이었다면 화면이 DB와 어긋나 있던 것이므로 목록을 다시 맞춘다.
      if (err instanceof TimelineSlotOccupiedError) reloadSmallImages();
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
    // 모달의 index 1부터는 TimelineMonth가 만든 것과 같은 기준(슬롯 순서로 보이는 작은 이미지)이다.
    const row = getVisibleSmallImages(smallImages.get(modal.month) ?? [])[index - 1];
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

      <HiddenStar id="timeline" className="absolute left-1/2 top-[38%] -translate-x-1/2" />

      <div className="flex flex-col gap-20 md:gap-28">
        {months.map((data, i) => (
          <Fragment key={data.month}>
            <TimelineMonth
              data={data}
              align={i % 2 === 0 ? "left" : "right"}
              coverImage={coverImages.get(data.month)}
              isUploadingCover={uploadingMonth === data.month}
              onAddCoverPhoto={() => requestCoverPhoto(data.month)}
              onDeleteCoverPhoto={() => setConfirmDeleteMonth(data.month)}
              smallImages={smallImages.get(data.month) ?? []}
              uploadingSmallSlot={
                uploadingSmallSlot?.month === data.month ? uploadingSmallSlot.sortOrder : null
              }
              isSmallSlotLocked={isTimelineBusy}
              onAddSmallPhoto={(sortOrder) => requestSmallPhoto(data.month, sortOrder)}
              onOpenImage={(images, index, alt) => setModal({ images, index, alt, month: data.month })}
            />
            {/* 정식 사이트 챕터 연출: 열두 달 중간쯤에서 한 번만 짧게 감성 문구를
                끼워 넣는다(요청: "1~2회 정도"). contribute 모드에서는 이 페이지
                자체가 접근 불가라 사실상 항상 아래 조건이지만, ChapterNote가
                스스로도 한 번 더 판단한다. */}
            {i === Math.floor(months.length / 2) - 1 && (
              <ChapterNote
                lines={["하루하루는 평범했지만,", "돌아보면 모두 하나의 이야기가 되었습니다."]}
              />
            )}
          </Fragment>
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
