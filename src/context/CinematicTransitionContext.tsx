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
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** 페이지를 실제로 넘기기 전, 문구를 보여주며 머무는 시간. */
const HOLD_MS = 900;
/** 오버레이 자체의 fade in/out 시간. */
const FADE_S = 0.25;

interface CinematicTransitionContextValue {
  /** href로 이동하기 전 짧은 전환 문구를 보여준다("다음 이야기" 버튼 전용 - 상단
   * Navigation의 자유 이동은 이 함수를 거치지 않고 그대로 즉시 이동한다). */
  navigate: (href: string, phrase: string) => void;
}

const CinematicTransitionContext = createContext<CinematicTransitionContextValue | null>(null);

/**
 * WONY 정식 사이트의 "챕터"형 페이지 전환(HOME → TIMELINE → ... → VIDEO) 전용 연출.
 * NextChapter 버튼이 이 Provider의 navigate()를 호출하면: 짙은 배경 위에 짧은
 * 문구가 fade-in → 잠시 머묾 → 실제 라우터 이동 → 오버레이 fade-out, 전체
 * 0.8~1.3초 안팎으로 끝낸다. prefers-reduced-motion이면 연출 없이 곧장 이동한다.
 */
export function CinematicTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [phrase, setPhrase] = useState<string | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const navigate = useCallback(
    (href: string, transitionPhrase: string) => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];

      if (prefersReducedMotion) {
        router.push(href);
        return;
      }

      setPhrase(transitionPhrase);
      const holdTimer = window.setTimeout(() => {
        router.push(href);
        const clearTimer = window.setTimeout(() => setPhrase(null), FADE_S * 1000 + 200);
        timeoutsRef.current.push(clearTimer);
      }, HOLD_MS);
      timeoutsRef.current.push(holdTimer);
    },
    [router, prefersReducedMotion]
  );

  const value = useMemo<CinematicTransitionContextValue>(() => ({ navigate }), [navigate]);

  return (
    <CinematicTransitionContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {phrase && (
          <motion.div
            key="cinematic-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_S, ease: "easeInOut" }}
            aria-hidden
            className="fixed inset-0 z-[98] flex items-center justify-center bg-bg/97"
          >
            <span className="absolute left-[28%] top-[32%] text-xs text-star/30">✦</span>
            <span className="absolute right-[26%] bottom-[30%] text-[10px] text-star/20">✦</span>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="font-serif-kr max-w-xs px-6 text-center text-sm italic leading-relaxed text-text-soft sm:text-base"
            >
              {phrase}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </CinematicTransitionContext.Provider>
  );
}

export function useCinematicTransition() {
  const ctx = useContext(CinematicTransitionContext);
  if (!ctx) {
    throw new Error("useCinematicTransition은 CinematicTransitionProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
