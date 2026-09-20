"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { uploadFanArt } from "@/lib/fanArt";
import { toErrorMessage } from "@/lib/letters";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  prepareImageForUpload,
  validateImageFile,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
} from "@/lib/imageProcessing";

const MAX_NICKNAME = 30;
const MAX_TITLE = 100;
const MAX_MESSAGE = 300;
const MAX_IMAGE_MB = MAX_IMAGE_BYTES / (1024 * 1024);

interface FieldErrors {
  nickname?: string;
  title?: string;
  message?: string;
  image?: string;
}

export default function FanArtForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
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
      setErrors((prev) => ({ ...prev, image: validationError }));
      setFile(null);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      e.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, image: undefined }));
    setFile(selected);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(selected);
    });
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    const trimmedNickname = nickname.trim();
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedNickname) next.nickname = "닉네임을 입력해주세요.";
    else if (trimmedNickname.length > MAX_NICKNAME)
      next.nickname = `닉네임은 ${MAX_NICKNAME}자 이내로 입력해주세요.`;

    if (!trimmedTitle) next.title = "작품명을 입력해주세요.";
    else if (trimmedTitle.length > MAX_TITLE)
      next.title = `작품명은 ${MAX_TITLE}자 이내로 입력해주세요.`;

    if (trimmedMessage.length > MAX_MESSAGE)
      next.message = `${MAX_MESSAGE}자 이내로 입력해주세요.`;

    if (!file) next.image = "팬아트 이미지를 선택해주세요.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !file) return;

    setSubmitState("submitting");
    try {
      const { blob, extension } = await prepareImageForUpload(file);
      await uploadFanArt({
        nickname: nickname.trim(),
        title: title.trim(),
        message: message.trim() || null,
        image: blob,
        imageExtension: extension,
      });
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
        </p>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="nickname" className="text-xs tracking-[0.2em] text-text-soft">
            닉네임
          </label>
          <span className="text-[11px] text-text-soft/60">
            {nickname.length}/{MAX_NICKNAME}
          </span>
        </div>
        <input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={MAX_NICKNAME}
          placeholder="예) 구름"
          className="border border-white/15 bg-bg-soft px-4 py-3 text-text outline-none transition-colors focus:border-pink"
        />
        {errors.nickname && <p className="text-xs text-pink">{errors.nickname}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="title" className="text-xs tracking-[0.2em] text-text-soft">
            작품명
          </label>
          <span className="text-[11px] text-text-soft/60">
            {title.length}/{MAX_TITLE}
          </span>
        </div>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE}
          placeholder="예) 겨울밤의 워니"
          className="border border-white/15 bg-bg-soft px-4 py-3 text-text outline-none transition-colors focus:border-pink"
        />
        {errors.title && <p className="text-xs text-pink">{errors.title}</p>}
      </div>

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
        {errors.image && <p className="text-xs text-pink">{errors.image}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="message" className="text-xs tracking-[0.2em] text-text-soft">
            워니에게 한마디 (선택)
          </label>
          <span className="text-[11px] text-text-soft/60">
            {message.length}/{MAX_MESSAGE}
          </span>
        </div>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_MESSAGE}
          rows={3}
          placeholder="이 작품에 담은 마음을 적어주세요."
          className="font-serif-kr resize-none border border-white/15 bg-bg-soft px-4 py-3 leading-relaxed text-text outline-none transition-colors focus:border-pink"
        />
        {errors.message && <p className="text-xs text-pink">{errors.message}</p>}
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
