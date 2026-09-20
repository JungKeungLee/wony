"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BGM_SRC, DEFAULT_BGM_VOLUME } from "@/lib/constants";

const VOLUME_STORAGE_KEY = "wony-bgm-volume";
const PLAY_PREFERENCE_STORAGE_KEY = "wony-bgm-play-preference";

type PlayPreference = "on" | "off" | null;

interface MusicContextValue {
  isPlaying: boolean;
  toggleMusic: () => void;
  /** 0~1 */
  volume: number;
  setVolume: (volume: number) => void;
  /** 영상 재생 등 다른 오디오가 필요한 순간에 BGM을 잠시 낮춘다. 사용자의 ON/OFF 선택은 건드리지 않는다. */
  pauseForOverlay: () => void;
  /** pauseForOverlay로 낮췄던 BGM을 되돌린다. 그 사이 사용자가 명시적으로 OFF했다면 켜지 않는다. */
  resumeForOverlay: () => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

function readStoredVolume(): number {
  if (typeof window === "undefined") return DEFAULT_BGM_VOLUME;
  const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
  const parsed = raw === null ? NaN : Number(raw);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) return DEFAULT_BGM_VOLUME;
  return parsed;
}

function readPlayPreference(): PlayPreference {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PLAY_PREFERENCE_STORAGE_KEY);
  return raw === "on" || raw === "off" ? raw : null;
}

function writePlayPreference(pref: "on" | "off") {
  try {
    window.localStorage.setItem(PLAY_PREFERENCE_STORAGE_KEY, pref);
  } catch {
    // 시크릿 모드 등 localStorage를 쓸 수 없는 환경에서도 재생/토글 자체는 계속 동작해야 한다.
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState<number>(readStoredVolume);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /** pauseForOverlay가 실제로 재생 중이던 것을 멈췄는지 기억해뒀다가 resumeForOverlay에서만 되돌린다. */
  const duckedRef = useRef(false);

  const toggleMusic = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      const audio = audioRef.current;
      if (audio) {
        if (next) {
          // currentTime을 건드리지 않으므로 pause했던 지점부터 이어서 재생된다.
          audio.play().catch(() => {
            // 자동재생 정책 등으로 재생이 거부되어도 UI 상태는 유지한다.
          });
        } else {
          audio.pause();
        }
      }
      // MUSIC ON/OFF는 사용자의 명시적인 선택이므로 항상 저장해서, 다음 방문 때도 그 선택을 따른다.
      writePlayPreference(next ? "on" : "off");
      return next;
    });
  }, []);

  const setVolume = useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    setVolumeState(clamped);
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
    } catch {
      // 시크릿 모드 등 localStorage를 쓸 수 없는 환경에서도 볼륨 조절 자체는 계속 동작해야 한다.
    }
  }, []);

  const pauseForOverlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      duckedRef.current = true;
      audio.pause();
      setIsPlaying(false);
    } else {
      duckedRef.current = false;
    }
  }, []);

  const resumeForOverlay = useCallback(() => {
    if (!duckedRef.current) return;
    duckedRef.current = false;
    // 영상을 보는 동안 사용자가 직접 MUSIC OFF를 눌렀다면 그 선택을 우선한다.
    if (readPlayPreference() === "off") return;
    audioRef.current
      ?.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // 재생이 거부되면 조용히 무시한다. 사용자가 MUSIC ON을 다시 누르면 된다.
      });
  }, []);

  // volume은 HTML 속성이 아니라 <audio> 엘리먼트의 JS 프로퍼티라 JSX props로 선언할 수
  // 없다(TypeScript에도 타입이 없다). state가 바뀔 때마다(초기 마운트 포함) 여기서
  // 직접 audio.volume에 반영한다.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // 페이지 진입 시 자동재생을 시도한다. 사용자가 이전에 명시적으로 MUSIC OFF를 선택했다면
  // 시도하지 않는다. 브라우저 정책으로 막히면(NotAllowedError 등) 에러를 노출하지 않고,
  // 첫 사용자 상호작용(click/touchstart/keydown) 때 다시 시도한 뒤 성공하면 리스너를 정리한다.
  useEffect(() => {
    if (!BGM_SRC) return;
    if (readPlayPreference() === "off") return;

    let isMounted = true;
    const events: Array<"click" | "touchstart" | "keydown"> = ["click", "touchstart", "keydown"];

    function detachRetryListeners() {
      events.forEach((event) => window.removeEventListener(event, retryOnInteraction));
    }

    function handlePlaySuccess() {
      if (!isMounted) return;
      setIsPlaying(true);
      writePlayPreference("on");
      detachRetryListeners();
    }

    function retryOnInteraction() {
      // 그 사이 사용자가 직접 MUSIC OFF를 눌렀다면 자동 재생 시도를 그만둔다.
      if (readPlayPreference() === "off") {
        detachRetryListeners();
        return;
      }
      audioRef.current
        ?.play()
        .then(handlePlaySuccess)
        .catch(() => {
          // 이번에도 막히면 리스너를 유지해 다음 상호작용을 기다린다.
        });
    }

    audioRef.current
      ?.play()
      .then(handlePlaySuccess)
      .catch(() => {
        if (!isMounted) return;
        events.forEach((event) => window.addEventListener(event, retryOnInteraction));
      });

    return () => {
      isMounted = false;
      detachRetryListeners();
    };
  }, []);

  const value = useMemo(
    () => ({ isPlaying, toggleMusic, volume, setVolume, pauseForOverlay, resumeForOverlay }),
    [isPlaying, toggleMusic, volume, setVolume, pauseForOverlay, resumeForOverlay]
  );

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
