"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { submitLetter } from "@/lib/letters";
import { isSupabaseConfigured } from "@/lib/supabase";

const MAX_NICKNAME = 30;
const MAX_CONTENT = 2000;
const MAX_MESSAGE_2027 = 300;

interface FieldErrors {
  nickname?: string;
  content?: string;
  message2027?: string;
}

export default function LetterForm() {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [message2027, setMessage2027] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState("");

  function validate(): boolean {
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
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitState("submitting");
    try {
      await submitLetter({
        nickname: nickname.trim(),
        content: content.trim(),
        message_2027: message2027.trim(),
        is_anonymous: isAnonymous,
      });
      setSubmitState("success");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-28 text-center">
        <span className="text-4xl">💌</span>
        <p className="font-serif-kr text-lg text-text sm:text-xl">
          당신의 마음이
          <br />
          워니에게 전달되었습니다.
        </p>
        <p className="text-sm text-text-soft">
          확인 후 편지함에 공개될 예정입니다.
        </p>
        <Link
          href="/letters"
          className="mt-4 border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink"
        >
          [ 편지함으로 돌아가기 ]
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
          Supabase가 아직 연결되지 않아 편지를 등록할 수 없습니다. 관리자에게
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
          placeholder="예) 별빛"
          className="border border-white/15 bg-bg-soft px-4 py-3 text-text outline-none transition-colors focus:border-pink"
        />
        {errors.nickname && (
          <p className="text-xs text-pink">{errors.nickname}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="content" className="text-xs tracking-[0.2em] text-text-soft">
            편지 내용
          </label>
          <span className="text-[11px] text-text-soft/60">
            {content.length}/{MAX_CONTENT}
          </span>
        </div>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={MAX_CONTENT}
          rows={8}
          placeholder="워니에게 전하고 싶은 이야기를 적어주세요."
          className="font-serif-kr resize-none border border-white/15 bg-bg-soft px-4 py-3 leading-relaxed text-text outline-none transition-colors focus:border-pink"
        />
        {errors.content && <p className="text-xs text-pink">{errors.content}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="message2027"
            className="text-xs tracking-[0.2em] text-text-soft"
          >
            2027년 워니에게 한마디
          </label>
          <span className="text-[11px] text-text-soft/60">
            {message2027.length}/{MAX_MESSAGE_2027}
          </span>
        </div>
        <textarea
          id="message2027"
          value={message2027}
          onChange={(e) => setMessage2027(e.target.value)}
          maxLength={MAX_MESSAGE_2027}
          rows={3}
          placeholder="2027년에도 행복하자."
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

      {submitState === "error" && (
        <p className="border border-pink/30 bg-bg-soft px-4 py-3 text-xs text-pink/90">
          편지를 전달하지 못했습니다. 잠시 후 다시 시도해주세요.
          {submitError && <span className="block text-text-soft/60">{submitError}</span>}
        </p>
      )}

      <button
        type="submit"
        disabled={submitState === "submitting" || !isSupabaseConfigured}
        className="border border-text-soft/40 px-8 py-3 text-sm tracking-[0.2em] text-text transition-colors hover:border-pink hover:text-pink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitState === "submitting" ? "전달하는 중..." : "편지 보내기"}
      </button>
    </form>
  );
}
