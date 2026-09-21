"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMusic } from "@/context/MusicContext";

interface PhoneIntroProps {
  /** WONY 앱을 눌러 스마트폰이 화면 전체로 확대되는 연출까지 끝났을 때 호출한다. */
  onComplete: () => void;
}

type LaunchStep = "idle" | "pressed" | "opening" | "preview" | "expand";

/** 눌러도 아무 반응 없는 장식용 앱들. WONY 앱 하나만 실제로 클릭 가능하다. */
const DECOR_APPS = [
  "✉",
  "♪",
  "◎",
  "▧",
  "⚙",
  "✎",
  "⌖",
];

const ARM_DELAY_MS = 500;
const PRESS_MS = 130;
const OPEN_MS = 170;
const PREVIEW_MS = 650;
const EXPAND_MS = 750;
const REDUCED_PREVIEW_MS = 350;
const REDUCED_EXPAND_MS = 450;

/**
 * 오프닝의 스마트폰 단계. 검은색 프레임 + 겨울밤 Wallpaper + 장식용 앱 아이콘들 위에
 * WONY 앱 하나만 클릭할 수 있다. 클릭하면
 * 눌림 → 아이콘 확대 → 화면 안에 HOME Hero와 비슷한 미리보기 → 스마트폰 전체 확대
 * 순서로 이어지다가, 그 끝에서 onComplete를 호출해 실제 HOME Hero로 연결한다.
 * prefers-reduced-motion에서는 확대 대신 단순 fade로 같은 단계를 거친다.
 */
export default function PhoneIntro({ onComplete }: PhoneIntroProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ensurePlayback } = useMusic();
  const [armed, setArmed] = useState(false);
  const [launchStep, setLaunchStep] = useState<LaunchStep>("idle");

  useEffect(() => {
    const timer = setTimeout(() => setArmed(true), ARM_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (launchStep === "idle") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (launchStep === "pressed") {
      timer = setTimeout(() => setLaunchStep("opening"), PRESS_MS);
    } else if (launchStep === "opening") {
      timer = setTimeout(() => setLaunchStep("preview"), OPEN_MS);
    } else if (launchStep === "preview") {
      timer = setTimeout(
        () => setLaunchStep("expand"),
        prefersReducedMotion ? REDUCED_PREVIEW_MS : PREVIEW_MS
      );
    } else if (launchStep === "expand") {
      timer = setTimeout(onComplete, prefersReducedMotion ? REDUCED_EXPAND_MS : EXPAND_MS);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [launchStep, onComplete, prefersReducedMotion]);

  function handleAppClick() {
    if (launchStep !== "idle") return;
    // WONY 앱 클릭은 명확한 사용자 인터랙션이므로, MUSIC이 OFF가 아니라면 이 시점부터
    // BGM 재생을 시도해서 autoplay 정책으로 막히는 경우를 줄인다.
    ensurePlayback();
    setLaunchStep("pressed");
  }

  const showPreviewScreen = launchStep === "preview" || launchStep === "expand";
  const expanding = launchStep === "expand";
  const chromeVisible = launchStep !== "expand";
  const expandDurationSec = (prefersReducedMotion ? REDUCED_EXPAND_MS : EXPAND_MS) / 1000;

  const iconIdlePulse = armed && launchStep === "idle" && !prefersReducedMotion;
  const iconScale: number | number[] =
    launchStep === "pressed" ? 0.88 : launchStep === "opening" ? 1.18 : iconIdlePulse ? [1, 1.06, 1] : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: expanding ? [1, 1, 0] : 1 }}
      exit={{ opacity: 0 }}
      transition={
        expanding
          ? { duration: expandDurationSec, times: [0, 0.65, 1], ease: "easeInOut" }
          : { duration: 0.5, ease: "easeOut" }
      }
      className="absolute inset-0 flex items-center justify-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{
          opacity: 1,
          scale: expanding && !prefersReducedMotion ? 22 : 1,
        }}
        transition={
          expanding
            ? { duration: expandDurationSec, ease: [0.4, 0, 0.2, 1] }
            : { duration: 0.7, ease: "easeOut" }
        }
        style={{ transformOrigin: "center center" }}
        className="relative aspect-[9/19.5] w-[250px] overflow-hidden rounded-[2.75rem] border border-white/15 bg-black shadow-[0_0_60px_rgba(0,0,0,0.55)] sm:w-[280px]"
      >
        {/* 상단 카메라 영역(장식용, Apple 노치를 그대로 흉내내지 않는 단순한 캡슐) */}
        <motion.div
          animate={{ opacity: chromeVisible ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="absolute left-1/2 top-2.5 z-20 h-1.5 w-14 -translate-x-1/2 rounded-full bg-black"
        />

        {/* 상태바 */}
        <motion.div
          animate={{ opacity: chromeVisible ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-4 text-[10px] text-text-soft/70"
        >
          <span>9:41</span>
          <span className="tracking-[0.1em]">✦ ▂▄▆</span>
        </motion.div>

        {/* 화면 */}
        <div className="absolute inset-0">
          {showPreviewScreen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,217,226,0.1),transparent_55%),linear-gradient(180deg,#080b16_0%,#111627_60%,#080b16_100%)] px-4 text-center"
            >
              <span className="font-display text-2xl tracking-[0.08em] text-text">WONY</span>
              <span className="font-display text-[8px] tracking-[0.3em] text-text-soft">
                OUR MEMORIES OF 2026
              </span>
            </motion.div>
          ) : (
            <div className="relative flex h-full w-full flex-col bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,217,226,0.06),transparent_55%),linear-gradient(180deg,#0a0e1c_0%,#111627_55%,#080b16_100%)] px-5 pb-8 pt-16">
              {/* 배경 별 몇 개 */}
              <span className="pointer-events-none absolute left-8 top-24 h-1 w-1 rounded-full bg-star/70" />
              <span className="pointer-events-none absolute right-10 top-32 h-[3px] w-[3px] rounded-full bg-star/50" />
              <span className="pointer-events-none absolute left-16 top-44 h-[2px] w-[2px] rounded-full bg-star/60" />

              <div className="grid flex-1 grid-cols-4 gap-4 content-start">
                {DECOR_APPS.map((glyph, i) => (
                  <div
                    key={i}
                    aria-hidden
                    className="flex aspect-square items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm text-text-soft/60"
                  >
                    {glyph}
                  </div>
                ))}

                <motion.button
                  type="button"
                  onClick={handleAppClick}
                  aria-label="WONY 앱 열기"
                  animate={{
                    scale: iconScale,
                    boxShadow: iconIdlePulse
                      ? [
                          "0 0 0px rgba(255,230,167,0)",
                          "0 0 16px rgba(255,230,167,0.5)",
                          "0 0 0px rgba(255,230,167,0)",
                        ]
                      : "0 0 0px rgba(255,230,167,0)",
                  }}
                  transition={
                    launchStep === "pressed" || launchStep === "opening"
                      ? { duration: 0.16, ease: "easeOut" }
                      : { duration: 1.7, repeat: 1, repeatDelay: 0.9, ease: "easeInOut" }
                  }
                  className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border border-star/30 bg-gradient-to-b from-bg-soft to-bg text-star"
                >
                  <span className="text-[8px] font-semibold tracking-[0.12em]">WONY</span>
                  <span aria-hidden className="text-sm leading-none">
                    ✦
                  </span>
                </motion.button>
              </div>

              {armed && launchStep === "idle" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="pt-4 text-center text-[10px] tracking-[0.1em] text-text-soft/60"
                >
                  한번 눌러볼까...?
                </motion.p>
              )}
            </div>
          )}
        </div>

        {/* 하단 홈 인디케이터 */}
        <motion.div
          animate={{ opacity: chromeVisible ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="absolute bottom-2 left-1/2 z-20 h-1 w-24 -translate-x-1/2 rounded-full bg-white/30"
        />
      </motion.div>
    </motion.div>
  );
}
