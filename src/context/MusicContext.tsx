"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BGM_SRC } from "@/lib/constants";

interface MusicContextValue {
  isPlaying: boolean;
  toggleMusic: () => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      const audio = audioRef.current;
      if (audio) {
        if (next) {
          audio.play().catch(() => {
            // 자동재생 정책 등으로 재생이 거부되어도 UI 상태는 유지한다.
          });
        } else {
          audio.pause();
        }
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ isPlaying, toggleMusic }), [isPlaying, toggleMusic]);

  return (
    <MusicContext.Provider value={value}>
      {children}
      {BGM_SRC && <audio ref={audioRef} src={BGM_SRC} loop />}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error("useMusic은 MusicProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
