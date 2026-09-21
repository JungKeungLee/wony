"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { uploadFanArt } from "@/lib/fanArt";
import { toErrorMessage } from "@/lib/letters";
import { getMissingSupabaseEnvVars, isSupabaseConfigured } from "@/lib/supabase";
import {
  prepareImageForUpload,
  validateImageFile,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
} from "@/lib/imageProcessing";

const MAX_IMAGE_MB = MAX_IMAGE_BYTES / (1024 * 1024);

export default function FanArtForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validationError = validateImageFile(selected);
    if (validationError) {
      setImageError(validationError);
      setFile(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      e.target.value = "";
      return;
    }

    setImageError("");
    setFile(selected);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(selected);
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setImageError("팬아트 이미지를 선택해주세요.");
      return;
    }

    setSubmitState("submitting");
    try {
      const { blob, extension } = await prepareImageForUpload(file);
      await uploadFanArt({ image: blob, imageExtension: extension });
      setSubmitState("success");
    } catch (err) {
      setSubmitError(toErrorMessage(err));
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-28 text-center">
        <span className="text-4xl">🎨</span>
        <p className="font-serif-kr text-lg text-text sm:text-xl">
          팬아트가 잘 전달되었습니다.
        </p>
        <p className="text-sm text-text-soft">
          확인 후 WONY FAN ART GALLERY에 공개될 예정입니다.
        </p>
        <Link
          href="/fan-art"
          className="mt-4 border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink"
        >
          [ 갤러리로 돌아가기 ]
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto flex max-w-lg flex-col gap-8 px-6 pb-32"
    >
      {!isSupabaseConfigured && (
        <p className="border border-pink/30 bg-bg-soft px-4 py-3 text-xs text-pink/90">
          Supabase가 아직 연결되지 않아 팬아트를 등록할 수 없습니다. 관리자에게
          문의해주세요.
          <span className="block text-text-soft/60">
            누락된 환경변수: {getMissingSupabaseEnvVars().join(", ")}
          </span>
        </p>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-xs tracking-[0.2em] text-text-soft">팬아트 이미지</span>

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="flex flex-col gap-3">
            <div className="flex max-h-72 items-center justify-center overflow-hidden border border-white/15 bg-bg-soft">
              {/* eslint-disable-next-line @next/next/no-img-element -- 로컬 File 미리보기(object URL)이라 next/image 대상이 아님 */}
              <img
                src={previewUrl}
                alt="선택한 이미지 미리보기"
                className="max-h-72 w-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="self-start text-xs tracking-[0.15em] text-text-soft underline underline-offset-4 transition-colors hover:text-pink"
            >
              다시 선택
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-40 flex-col items-center justify-center gap-2 border border-dashed border-white/20 text-text-soft transition-colors hover:border-pink/50 hover:text-pink"
          >
            <span className="text-2xl">＋</span>
            <span className="text-xs tracking-[0.15em]">
              이미지 선택 (JPG · PNG · WebP, {MAX_IMAGE_MB}MB 이하)
            </span>
          </button>
        )}
        {imageError && <p className="text-xs text-pink">{imageError}</p>}
      </div>

      {submitState === "error" && (
        <p className="border border-pink/30 bg-bg-soft px-4 py-3 text-xs text-pink/90">
          팬아트를 전달하지 못했습니다. 잠시 후 다시 시도해주세요.
          {submitError && <span className="block text-text-soft/60">{submitError}</span>}
        </p>
      )}

      <button
        type="submit"
        disabled={submitState === "submitting" || !isSupabaseConfigured}
        className="border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitState === "submitting" ? "전달하는 중..." : "팬아트 보내기"}
      </button>
    </form>
  );
}
