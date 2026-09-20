"use client";

import { useEffect, useState } from "react";
import { fetchApprovedLetters, toErrorMessage } from "@/lib/letters";
import type { Letter } from "@/lib/types";
import LetterCard from "./LetterCard";
import LetterModal from "./LetterModal";

type Status = "loading" | "success" | "error";

export default function LetterGrid() {
  const [status, setStatus] = useState<Status>("loading");
  const [letters, setLetters] = useState<Letter[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchApprovedLetters();
        if (cancelled) return;
        setLetters(data);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(toErrorMessage(err, "편지를 불러오지 못했습니다."));
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-text-soft">
        <span className="animate-pulse text-2xl text-star">✦</span>
        <p className="text-sm tracking-[0.2em]">편지를 불러오는 중...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-serif-kr text-text-soft">
          편지를 불러오지 못했습니다.
        </p>
        <p className="mt-2 text-xs text-text-soft/60">{errorMessage}</p>
      </div>
    );
  }

  if (letters.length === 0) {
    return (
      <div className="px-6 py-24 text-center">
        <p className="font-serif-kr text-text-soft">
          아직 도착한 편지가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-6 pb-32 sm:grid-cols-2 lg:grid-cols-3">
        {letters.map((letter, i) => (
          <LetterCard
            key={letter.id}
            letter={letter}
            delay={(i % 6) * 0.08}
            onOpen={() => setActiveLetter(letter)}
          />
        ))}
      </div>

      <LetterModal letter={activeLetter} onClose={() => setActiveLetter(null)} />
    </>
  );
}
