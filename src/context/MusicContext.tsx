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
import { usePathname } from "next/navigation";
import { DEFAULT_BGM_SRC, DEFAULT_BGM_VOLUME, SURPRISE_BGM_SRC } from "@/lib/constants";

const VOLUME_STORAGE_KEY = "wony-bgm-volume";
const PLAY_PREFERENCE_STORAGE_KEY = "wony-bgm-play-preference";
const CROSSFADE_MS = 1300;

type PlayPreference = "on" | "off" | null;
type Track = "default" | "surprise";

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
  /**
   * SURPRISE 엔딩처럼 연출상 볼륨을 살짝만 낮추고 싶을 때 쓴다. 사용자가 설정한
   * volume state/localStorage는 전혀 건드리지 않고, 실제 재생 중인 audio 엘리먼트의
   * 소리 크기만 그 값에 factor를 곱해 일시적으로 낮춘다.
   */
  duckVolume: (factor: number) => void;
  /** duckVolume으로 낮췄던 소리를 사용자의 실제 볼륨 설정값으로 되돌린다. */
  restoreVolume: () => void;
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

function trackForPathname(pathname: string | null): Track {
  return pathname === "/surprise" ? "surprise" : "default";
}

/** 끊김 없이 재생을 시작할 수 있다고 볼 수 있는 최소 readyState (HAVE_FUTURE_DATA). */
const READY_ENOUGH_STATE = 3;

/**
 * audio.src만 미리 지정해두고 실제로 재생 가능한 상태가 될 때까지 기다렸다가 play()를
 * 호출한다. 이미 충분히 로드돼 있으면(예: 이전에 재생 중이던 트랙) 곧바로 시도하고,
 * 아직 아무것도 불러오지 않은 상태(HAVE_NOTHING)라면 load()로 버퍼링을 깨운 뒤
 * canplay 이벤트를 기다린다. 성공/실패 여부는 onSettled로 알려주고, play() Promise가
 * 거부되면 원인을 콘솔에 남긴다(화면에는 노출하지 않는다).
 */
function playWhenReady(audio: HTMLAudioElement, onSettled: (success: boolean, error?: unknown) => void) {
  audio.muted = false;

  function attempt() {
    audio
      .play()
      .then(() => onSettled(true))
      .catch((error) => {
        console.error("[MusicContext] BGM 재생에 실패했습니다:", error);
        onSettled(false, error);
      });
  }

  if (audio.readyState >= READY_ENOUGH_STATE) {
    attempt();
    return;
  }

  function handleCanPlay() {
    audio.removeEventListener("canplay", handleCanPlay);
    attempt();
  }
  audio.addEventListener("canplay", handleCanPlay);
  if (audio.readyState === 0) {
    audio.load();
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState<number>(readStoredVolume);

  const defaultAudioRef = useRef<HTMLAudioElement | null>(null);
  const surpriseAudioRef = useRef<HTMLAudioElement | null>(null);
  /** 현재 페이지 기준으로 실제 소리를 내야 하는 트랙. pathname이 바뀔 때만 전환된다. */
  const activeTrackRef = useRef<Track>(trackForPathname(pathname));
  /** pauseForOverlay가 실제로 재생 중이던 것을 멈췄는지 기억해뒀다가 resumeForOverlay에서만 되돌린다. */
  const duckedRef = useRef(false);
  const isPlayingRef = useRef(isPlaying);
  const volumeRef = useRef(volume);
  const crossfadeFrameRef = useRef<number | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const getAudio = useCallback((track: Track) => {
    return track === "default" ? defaultAudioRef.current : surpriseAudioRef.current;
  }, []);

  const getActiveAudio = useCallback(() => {
    return getAudio(activeTrackRef.current);
  }, [getAudio]);

  const toggleMusic = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      const audio = getActiveAudio();
      if (audio) {
        if (next) {
          // currentTime을 건드리지 않으므로 pause했던 지점부터 이어서 재생된다.
          audio.volume = volumeRef.current;
          playWhenReady(audio, (success) => {
            if (success || readPlayPreference() === "off") return;
            // 클릭이라는 명확한 사용자 동작 직후인데도 막힌 드문 경우, 다음 상호작용
            // 때 한 번 더 시도해서 "MUSIC ON"인데 실제로는 무음인 상태로 고착되지 않게 한다.
            const events: Array<"click" | "touchstart" | "keydown"> = ["click", "touchstart", "keydown"];
            function retry() {
              if (readPlayPreference() === "off") {
                events.forEach((event) => window.removeEventListener(event, retry));
                return;
              }
              const current = getActiveAudio();
              if (!current) return;
              playWhenReady(current, (retrySuccess) => {
                if (retrySuccess) events.forEach((event) => window.removeEventListener(event, retry));
              });
            }
            events.forEach((event) => window.addEventListener(event, retry));
          });
        } else {
          audio.pause();
        }
      }
      // MUSIC ON/OFF는 사용자의 명시적인 선택이므로 항상 저장해서, 다음 방문 때도 그 선택을 따른다.
      writePlayPreference(next ? "on" : "off");
      return next;
    });
  }, [getActiveAudio]);

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
    const audio = getActiveAudio();
    if (audio && !audio.paused) {
      duckedRef.current = true;
      audio.pause();
      setIsPlaying(false);
    } else {
      duckedRef.current = false;
    }
  }, [getActiveAudio]);

  const resumeForOverlay = useCallback(() => {
    if (!duckedRef.current) return;
    duckedRef.current = false;
    // 영상을 보는 동안 사용자가 직접 MUSIC OFF를 눌렀다면 그 선택을 우선한다.
    if (readPlayPreference() === "off") return;
    const audio = getActiveAudio();
    if (audio) audio.volume = volumeRef.current;
    audio
      ?.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // 재생이 거부되면 조용히 무시한다. 사용자가 MUSIC ON을 다시 누르면 된다.
      });
  }, [getActiveAudio]);

  const duckVolume = useCallback(
    (factor: number) => {
      const audio = getActiveAudio();
      if (audio) {
        audio.volume = Math.max(0, Math.min(1, volume * factor));
      }
    },
    [getActiveAudio, volume]
  );

  const restoreVolume = useCallback(() => {
    const audio = getActiveAudio();
    if (audio) audio.volume = volume;
  }, [getActiveAudio, volume]);

  // volume은 HTML 속성이 아니라 <audio> 엘리먼트의 JS 프로퍼티라 JSX props로 선언할 수
  // 없다(TypeScript에도 타입이 없다). state가 바뀔 때마다(초기 마운트 포함) 여기서
  // 두 트랙 모두에 반영해, 어느 쪽이 활성화되든 항상 같은 사용자 볼륨을 쓰게 한다.
  useEffect(() => {
    if (defaultAudioRef.current) defaultAudioRef.current.volume = volume;
    if (surpriseAudioRef.current) surpriseAudioRef.current.volume = volume;
  }, [volume]);

  // 페이지 진입 시 자동재생을 시도한다. 사용자가 이전에 명시적으로 MUSIC OFF를 선택했다면
  // 시도하지 않는다. 브라우저 정책으로 막히면(NotAllowedError 등) 에러를 노출하지 않고,
  // 첫 사용자 상호작용(click/touchstart/keydown) 때 다시 시도한 뒤 성공하면 리스너를 정리한다.
  // 최초 마운트 시점의 pathname에 해당하는 트랙만 재생을 시도한다.
  useEffect(() => {
    if (readPlayPreference() === "off") return;

    let isMounted = true;
    const audio = getActiveAudio();
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
      audio
        ?.play()
        .then(handlePlaySuccess)
        .catch(() => {
          // 이번에도 막히면 리스너를 유지해 다음 상호작용을 기다린다.
        });
    }

    audio
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pathname이 일반 페이지 <-> /surprise 경계를 넘을 때만 트랙을 서서히 교차시킨다.
  // 같은 트랙 안에서의 페이지 이동(예: HOME -> TIMELINE)은 재생을 전혀 건드리지 않는다.
  useEffect(() => {
    const nextTrack = trackForPathname(pathname);
    const prevTrack = activeTrackRef.current;
    if (nextTrack === prevTrack) return;

    activeTrackRef.current = nextTrack;

    if (crossfadeFrameRef.current !== null) {
      cancelAnimationFrame(crossfadeFrameRef.current);
      crossfadeFrameRef.current = null;
    }

    const from = getAudio(prevTrack);
    const to = getAudio(nextTrack);

    // MUSIC OFF 상태라면 재생 없이 조용히 트랙만 바꿔둔다. 다음에 사용자가 켜면
    // 그 시점의 activeTrackRef가 가리키는(=현재 페이지에 맞는) 트랙이 재생된다.
    if (!isPlayingRef.current || readPlayPreference() === "off") {
      from?.pause();
      return;
    }

    let cancelled = false;
    const retryEvents: Array<"click" | "touchstart" | "keydown"> = ["click", "touchstart", "keydown"];

    function detachRetryListeners() {
      retryEvents.forEach((event) => window.removeEventListener(event, retryOnInteraction));
    }

    // 이 트랙 전환이 여전히 유효한지(도중에 다른 페이지로 또 이동하거나, 그 사이
    // MUSIC OFF를 누르지 않았는지) 확인한다. play() 성공/재시도는 모두 비동기라
    // 결과가 돌아왔을 때 상황이 이미 바뀌어 있을 수 있다.
    function isStillRelevant() {
      return !cancelled && activeTrackRef.current === nextTrack && isPlayingRef.current && readPlayPreference() !== "off";
    }

    function runFade() {
      const targetVolume = volumeRef.current;
      const fromStartVolume = from?.volume ?? 0;
      const startedAt = performance.now();

      function step(now: number) {
        // requestAnimationFrame의 now는 프레임 간격(보통 ~16ms) 단위로만 갱신되므로
        // 목표 시각을 살짝 넘는 값이 들어올 수 있다. Math.min/max로 반드시 [0,1] 범위로
        // 고정해야 volume에 범위 밖 값(RangeError)을 대입하지 않는다.
        const progress = Math.min(1, Math.max(0, (now - startedAt) / CROSSFADE_MS));
        if (from) from.volume = Math.min(1, Math.max(0, fromStartVolume * (1 - progress)));
        if (to) to.volume = Math.min(1, Math.max(0, targetVolume * progress));

        if (progress < 1) {
          crossfadeFrameRef.current = requestAnimationFrame(step);
        } else {
          crossfadeFrameRef.current = null;
          from?.pause();
        }
      }

      crossfadeFrameRef.current = requestAnimationFrame(step);
    }

    function retryOnInteraction() {
      if (!isStillRelevant() || !to) {
        detachRetryListeners();
        return;
      }
      playWhenReady(to, (success) => {
        if (!isStillRelevant()) {
          if (success) to.pause();
          return;
        }
        if (success) {
          detachRetryListeners();
          runFade();
        }
        // 실패하면 리스너를 유지해 다음 상호작용을 기다린다(에러는 이미 콘솔에 기록됨).
      });
    }

    if (!to) {
      runFade();
    } else {
      // 새 트랙이 실제로 재생을 시작하기 전까지는 기존 트랙을 그대로 들려준다 -
      // 재생 시도가 실패했는데도 기존 트랙을 미리 줄여버리면 두 곡 모두 무음이 되는
      // 문제가 생기기 때문에, 성공을 확인한 뒤에야 페이드를 시작한다.
      to.volume = 0;
      playWhenReady(to, (success) => {
        if (!isStillRelevant()) {
          if (success) to.pause();
          return;
        }
        if (success) {
          runFade();
        } else {
          // 브라우저 autoplay 정책 등으로 막힌 경우, 첫 상호작용 때 다시 시도한다.
          // (이미 재생 중이던 이전 트랙은 계속 들리므로 무음 상태가 되지 않는다.)
          retryEvents.forEach((event) => window.addEventListener(event, retryOnInteraction));
        }
      });
    }

    return () => {
      cancelled = true;
      detachRetryListeners();
      if (crossfadeFrameRef.current !== null) {
        cancelAnimationFrame(crossfadeFrameRef.current);
        crossfadeFrameRef.current = null;
      }
    };
  }, [pathname, getAudio]);

  const value = useMemo(
    () => ({
      isPlaying,
      toggleMusic,
      volume,
      setVolume,
      pauseForOverlay,
      resumeForOverlay,
      duckVolume,
      restoreVolume,
    }),
    [isPlaying, toggleMusic, volume, setVolume, pauseForOverlay, resumeForOverlay, duckVolume, restoreVolume]
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={defaultAudioRef} src={DEFAULT_BGM_SRC} loop />
      <audio ref={surpriseAudioRef} src={SURPRISE_BGM_SRC} loop />
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
