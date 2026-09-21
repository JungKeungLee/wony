"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useHasMounted } from "@/lib/useHasMounted";

/**
 * 목표 시각(KST, UTC+9). 실제 배포 전 이 3개 상수만 원하는 날짜로 바꾸면 된다 -
 * 지금은 2026-09-22 00:00:00(KST)을 기준으로 맞춰져 있다(요청 시점 기준 테스트용 값).
 */
const SMALL_COUNTDOWN_START = new Date("2026-09-21T23:15:00+09:00").getTime();
const FINAL_TEN_START = new Date("2026-09-21T23:59:50+09:00").getTime();
const TARGET_TIME = new Date("2026-09-22T00:00:00+09:00").getTime();
/** 큰 "HAPPY 2027" 연출을 몇 ms 동안 보여줄지. */
const CELEBRATION_DURATION_MS = 5200;

const SEEN_STORAGE_KEY = "wony-newyear-2027-seen";

type Phase = "idle" | "small" | "finalTen" | "celebrating" | "after";

function computePhase(now: number, alreadySeen: boolean): Phase {
  if (now < SMALL_COUNTDOWN_START) return "idle";
  if (now < FINAL_TEN_START) return "small";
  if (now < TARGET_TIME) return "finalTen";
  if (!alreadySeen && now < TARGET_TIME + CELEBRATION_DURATION_MS) return "celebrating";
  return "after";
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** 골든 앵글 의사난수 - StarField 등 다른 별 연출과 동일한 방식. */
function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}
const SPARK_COUNT = 16;
const SPARKS = Array.from({ length: SPARK_COUNT }, (_, i) => ({
  angle: (360 / SPARK_COUNT) * i + pseudoRandom(i * 3.7 + 1) * 12,
  distance: 70 + pseudoRandom(i * 5.1 + 2) * 60,
  delay: pseudoRandom(i * 6.3 + 3) * 0.4,
}));

function readAlreadySeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeAlreadySeen() {
  try {
    window.localStorage.setItem(SEEN_STORAGE_KEY, "true");
  } catch {
    // 시크릿 모드 등에서는 저장이 안 되더라도 이번 세션 안에서는 계속 동작한다.
  }
}

/**
 * 사이트 전역에 떠 있는 연말 카운트다운. 23:30부터 작은 뱃지로 남은 시간을 보여주고,
 * 마지막 10초는 화면 중앙에 크게, 자정이 되면 "HAPPY 2027"을 잠깐 띄운 뒤 자동으로
 * HOME으로 돌아가고 이후에는 작은 뱃지 자리에 "HAPPY 2027 ✦" 상태만 남긴다.
 * SURPRISE 페이지의 자체 연출과 겹치지 않도록, 전체화면 연출(마지막 10초/HAPPY 2027)은
 * /surprise에서는 띄우지 않는다(작은 뱃지는 그대로 보여준다).
 */
export default function YearEndCountdown() {
  const hasMounted = useHasMounted();
  const pathname = usePathname();
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  const [alreadySeen, setAlreadySeen] = useState(false);
  const [hasLoadedSeen, setHasLoadedSeen] = useState(false);
  const [redirected, setRedirected] = useState(false);

  // 마운트 직후 렌더 도중 한 번만 localStorage 값을 읽어온다(effect가 아닌 렌더 중
  // 직접 - set-state-in-effect를 피하는 이 세션의 표준 패턴). Date.now()는 렌더 중
  // 호출하면 impure로 걸리므로 여기서는 건드리지 않고, 아래 effect의 타이머(비동기
  // 콜백)에서만 읽는다.
  if (hasMounted && !hasLoadedSeen) {
    setHasLoadedSeen(true);
    setAlreadySeen(readAlreadySeen());
  }

  useEffect(() => {
    if (!hasMounted) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [hasMounted]);

  const phase: Phase = now === null ? "idle" : computePhase(now, alreadySeen);

  // 축하 연출이 끝나면 한 번만: "봤음" 표시를 저장하고, HOME이 아니면 HOME으로 보낸다.
  useEffect(() => {
    if (phase !== "celebrating") return;
    const timer = setTimeout(() => {
      writeAlreadySeen();
      setAlreadySeen(true);
      if (pathname !== "/" && !redirected) {
        setRedirected(true);
        router.push("/");
      }
    }, CELEBRATION_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase, pathname, router, redirected]);

  if (phase === "idle" || now === null) return null;

  const isSurprisePage = pathname === "/surprise";
  const remainingMs = TARGET_TIME - now;

  return (
    <>
      {(phase === "small" || phase === "after") && (
        <div className="fixed bottom-4 right-4 z-30 flex items-center gap-1.5 border border-white/10 bg-bg/70 px-3 py-1.5 text-[11px] tracking-[0.15em] text-star/80 backdrop-blur-sm">
          <span aria-hidden>✦</span>
          {phase === "after" ? (
            <span>HAPPY 2027</span>
          ) : (
            <span>2027년까지 {formatRemaining(remainingMs)}</span>
          )}
        </div>
      )}

      {phase === "finalTen" && !isSurprisePage && (
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-5 bg-bg/95 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.span
              key={Math.ceil(remainingMs / 1000)}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="font-display text-8xl text-star sm:text-9xl"
            >
              {Math.max(1, Math.ceil(remainingMs / 1000))}
            </motion.span>
          </AnimatePresence>
          <p className="font-serif-kr text-sm tracking-[0.15em] text-text-soft">
            2027년이 곧 시작됩니다
          </p>
        </div>
      )}

      {phase === "celebrating" && !isSurprisePage && (
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-bg/95 backdrop-blur-sm">
          <div className="relative flex items-center justify-center">
            {SPARKS.map((spark, i) => {
              const rad = (spark.angle * Math.PI) / 180;
              const x = Math.cos(rad) * spark.distance;
              const y = Math.sin(rad) * spark.distance;
              return (
                <motion.span
                  key={i}
                  aria-hidden
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 1, 0], x, y, scale: 1 }}
                  transition={{ duration: 1.4, delay: spark.delay, ease: "easeOut" }}
                  className="absolute h-1.5 w-1.5 rounded-full bg-star"
                  style={{ boxShadow: "0 0 8px 2px rgba(255,230,167,0.6)" }}
                />
              );
            })}
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-display text-4xl tracking-wide text-text sm:text-6xl"
            >
              HAPPY 2027 <span className="text-star">✦</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-serif-kr text-sm text-text-soft"
          >
            새로운 한 해도 함께해요.
          </motion.p>
        </div>
      )}
    </>
  );
}
