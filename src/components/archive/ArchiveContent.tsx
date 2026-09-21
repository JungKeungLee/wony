"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { ArchiveMonth } from "@/data/archive";
import type { ArchiveComment, ArchiveImage } from "@/lib/types";
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
import { toErrorMessage } from "@/lib/letters";
import { prepareThumbnailForUpload, validateImageFile } from "@/lib/imageProcessing";
import ArchiveMonthSection from "./ArchiveMonthSection";
import ArchiveImageModal from "./ArchiveImageModal";
import StatusToast from "@/components/ui/StatusToast";

interface ArchiveContentProps {
  months: ArchiveMonth[];
}

export default function ArchiveContent({ months }: ArchiveContentProps) {
  const [images, setImages] = useState<Map<string, ArchiveImage>>(new Map());
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [viewingArchiveId, setViewingArchiveId] = useState<string | null>(null);
  const [comments, setComments] = useState<Map<string, ArchiveComment>>(new Map());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<{ archiveId: string; month: number } | null>(null);

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

  const viewingImage = viewingArchiveId ? (images.get(viewingArchiveId) ?? null) : null;

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

      {months.map((monthData, i) => (
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
        />
      ))}

      <ArchiveImageModal
        archiveId={viewingArchiveId}
        image={viewingImage}
        onClose={() => setViewingArchiveId(null)}
        onReplace={requestPhoto}
        onDelete={handleDeleteImage}
      />

      <StatusToast message={statusMessage} onDismiss={() => setStatusMessage(null)} />
    </>
  );
}
