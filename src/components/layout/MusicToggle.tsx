"use client";

import { useMusic } from "@/context/MusicContext";

export default function MusicToggle({ className = "" }: { className?: string }) {
  const { isPlaying, toggleMusic } = useMusic();

  return (
    <button
      type="button"
      onClick={toggleMusic}
      aria-pressed={isPlaying}
      className={`flex items-center gap-2 text-xs tracking-[0.2em] text-text-soft transition-colors hover:text-pink ${className}`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${isPlaying ? "bg-pink" : "bg-text-soft/50"}`}
      />
      MUSIC {isPlaying ? "ON" : "OFF"}
    </button>
  );
}
