"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMusic } from "@/context/MusicContext";

interface PhoneIntroProps {
  /** WONY 앱을 눌러 스마트폰이 화면 전체로 확대되는 연출까지 끝났을 때 호출한다. */
  onComplete: () => void;
}

type LaunchStep = "idle" | "pressed" | "opening" | "preview" | "expand";

const ARM_DELAY_MS = 500;
const PRESS_MS = 130;
const OPEN_MS = 170;
const PREVIEW_MS = 650;
const EXPAND_MS = 750;
const REDUCED_PREVIEW_MS = 350;
const REDUCED_EXPAND_MS = 450;

/**
 * WONY 앱 탭 영역 - public/images/phone-home.png 안에서 "WONY" 아이콘+라벨이
 * 차지하는 위치를 이미지 전체(1024x1536) 대비 퍼센트로 잡은 값이다. 실제
 * 아이콘보다 살짝 넉넉하게 잡았다(요청: "아이콘 + label 영역 전체").
 * 이미지를 다른 파일로 교체하면 이 값도 다시 맞춰야 한다.
 */
const WONY_TAP_AREA = { left: "21%", top: "27.5%", width: "15%", height: "11.5%" };

/**
 * 오프닝의 스마트폰 단계. public/images/phone-home.png(완성된 스마트폰 HOME
 * 화면 이미지)를 그대로 보여주고, 그 위 WONY 아이콘 자리에만 투명한 클릭
 * 영역을 얹는다 - 이미지를 HTML/CSS로 다시 그리지 않는다. 클릭하면
 * 눌림 → 짧은 오프닝 → 화면 안에 HOME Hero와 비슷한 미리보기 → 스마트폰 전체
 * 확대 순서로 이어지다가, 그 끝에서 onComplete를 호출해 실제 HOME Hero로
 * 연결한다. prefers-reduced-motion에서는 확대 대신 단순 fade로 같은 단계를 거친다.
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
  const expandDurationSec = (prefersReducedMotion ? REDUCED_EXPAND_MS : EXPAND_MS) / 1000;

  const iconIdlePulse = armed && launchStep === "idle" && !prefersReducedMotion;
  const iconScale: number | number[] =
    launchStep === "pressed" ? 0.9 : launchStep === "opening" ? 1.08 : iconIdlePulse ? [1, 1.05, 1] : 1;

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
        className="relative aspect-[1024/1536] w-[78vw] max-w-[300px] overflow-hidden sm:max-w-[360px]"
      >
        {showPreviewScreen ? (
          /* WONY 앱이 열리는 순간의 짧은 미리보기 - 이미지 위가 아니라 화면
             전체를 덮는 자체 배경으로 보여준다(이미지를 다시 그리지 않고,
             이미지와 겹쳐 보이지도 않는다). */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,217,226,0.1),transparent_55%),linear-gradient(180deg,#080b16_0%,#111627_60%,#080b16_100%)] px-4 text-center"
          >
            <span className="font-display text-2xl tracking-[0.08em] text-text">WONY</span>
            <span className="font-display text-[8px] tracking-[0.3em] text-text-soft">
              OUR MEMORIES OF 2026
            </span>
          </motion.div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- 완성된 스마트폰 HOME 화면 그래픽을 그대로 보여주는 정적 이미지 */}
            <img
              src="/images/phone-home.png"
              alt="스마트폰 HOME 화면 - WONY 앱을 눌러 들어가세요"
              className="absolute inset-0 h-full w-full select-none object-cover"
              draggable={false}
            />

            {/* WONY 앱 위에만 얹는 투명 클릭 영역 - 이미지 자체는 건드리지 않고,
                은은한 glow/hover/클릭 피드백만 이 영역에 적용한다. */}
            <motion.button
              type="button"
              onClick={handleAppClick}
              aria-label="WONY 앱 열기"
              style={WONY_TAP_AREA}
              whileHover={{ backgroundColor: "rgba(255,230,167,0.1)" }}
              animate={{
                scale: iconScale,
                boxShadow: iconIdlePulse
                  ? [
                      "0 0 0px rgba(255,230,167,0)",
                      "0 0 18px rgba(255,230,167,0.55)",
                      "0 0 0px rgba(255,230,167,0)",
                    ]
                  : "0 0 0px rgba(255,230,167,0)",
              }}
              transition={
                launchStep === "pressed" || launchStep === "opening"
                  ? { duration: 0.16, ease: "easeOut" }
                  : { duration: 1.7, repeat: 1, repeatDelay: 0.9, ease: "easeInOut" }
              }
              className="absolute cursor-pointer rounded-2xl bg-transparent"
            />
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
