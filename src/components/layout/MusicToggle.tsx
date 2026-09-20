"use client";

import { useMusic } from "@/context/MusicContext";

export default function MusicToggle({ className = "" }: { className?: string }) {
  const { isPlaying, toggleMusic, volume, setVolume } = useMusic();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={toggleMusic}
        aria-pressed={isPlaying}
        className="flex items-center gap-2 text-xs tracking-[0.2em] text-text-soft transition-colors hover:text-pink"
      >
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${isPlaying ? "bg-pink" : "bg-text-soft/50"}`}
        />
        MUSIC {isPlaying ? "ON" : "OFF"}
      </button>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(volume * 100)}
        onChange={(e) => setVolume(Number(e.target.value) / 100)}
        aria-label="배경음악 볼륨"
        className="h-1 w-16 cursor-pointer accent-pink"
      />
    </div>
  );
}
