"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** 최초 진입 후 자동 스크롤이 시작되기까지 대기 시간. */
const START_DELAY_MS = 2500;
/** 영화 엔딩 크레딧처럼 느린 속도(px/s). */
const SPEED_PX_PER_SEC = 40;

export type AutoScrollState = "pending" | "running" | "paused" | "stopped";

interface UseAutoScrollOptions {
  /** 이 요소의 상단이 뷰포트 상단에 닿으면 자동 스크롤을 멈추고 다시는 재개하지 않는다. */
  stopAtRef: RefObject<HTMLElement | null>;
  /** false면(prefers-reduced-motion 등) 기능 전체를 비활성화하고 일반 페이지처럼 둔다. */
  enabled: boolean;
}

/**
 * requestAnimationFrame 기반의 아주 느린 자동 스크롤. setInterval + 큰 단위 scrollBy로
 * 뚝뚝 움직이지 않도록, 매 프레임 경과 시간(delta)에 비례한 아주 작은 양만 이동시킨다.
 * wheel/touchmove/키보드 스크롤 입력이 감지되면 즉시 멈추고, 자동으로 재개하지 않는다
 * (사용자가 직접 버튼을 눌러야 다시 움직인다).
 */
export function useAutoScroll({ stopAtRef, enabled }: UseAutoScrollOptions) {
  const [state, setState] = useState<AutoScrollState>("pending");
  const rafIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  /**
   * SPEED_PX_PER_SEC가 프레임당(~16ms) 1px 미만이라 window.scrollBy에 그대로 넘기면
   * 브라우저가 소수점 이하를 버려 아예 안 움직일 수 있다. 소수점 잔여분을 여기 누적했다가
   * 1px 이상 쌓였을 때만 정수 픽셀 단위로 scrollBy를 호출한다.
   */
  const pendingPixelsRef = useRef(0);
  /** 재개/일시정지 버튼 자체를 누르는 것은 "사용자가 수동으로 스크롤함"으로 치지 않는다. */
  const controlRef = useRef<HTMLButtonElement | null>(null);

  const pause = useCallback(() => {
    setState((prev) => (prev === "stopped" ? prev : "paused"));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => (prev === "stopped" ? prev : "running"));
  }, []);

  // 최초 진입 후 잠시 기다렸다가 자동 시작한다. 그 사이 사용자가 이미 직접
  // 스크롤했다면(state가 "paused"로 바뀌어 있다면) 강제로 재개하지 않는다.
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      setState((prev) => (prev === "pending" ? "running" : prev));
    }, START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled]);

  // rAF 스크롤 루프. state가 "running"일 때만 돈다.
  useEffect(() => {
    if (!enabled || state !== "running") return;

    lastTimestampRef.current = null;
    pendingPixelsRef.current = 0;

    function step(timestamp: number) {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const deltaSeconds = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const stopEl = stopAtRef.current;
      if (stopEl && stopEl.getBoundingClientRect().top <= 0) {
        setState("stopped");
        return;
      }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= maxScroll - 1) {
        setState("stopped");
        return;
      }

      pendingPixelsRef.current += SPEED_PX_PER_SEC * deltaSeconds;
      const wholePixels = Math.floor(pendingPixelsRef.current);
      if (wholePixels >= 1) {
        window.scrollBy(0, wholePixels);
        pendingPixelsRef.current -= wholePixels;
      }
      rafIdRef.current = requestAnimationFrame(step);
    }

    rafIdRef.current = requestAnimationFrame(step);
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [enabled, state, stopAtRef]);

  // 사용자의 직접 스크롤 조작(휠/터치/키보드)을 감지하면 즉시 멈춘다.
  // 재개/일시정지 버튼 자체에 대한 입력은 제외한다.
  useEffect(() => {
    if (!enabled) return;

    function handleUserInput(e: Event) {
      if (controlRef.current && e.target instanceof Node && controlRef.current.contains(e.target)) {
        return;
      }
      if (e instanceof KeyboardEvent) {
        const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", " ", "Spacebar"];
        if (!scrollKeys.includes(e.key)) return;
      }
      setState((prev) => (prev === "running" || prev === "pending" ? "paused" : prev));
    }

    window.addEventListener("wheel", handleUserInput, { passive: true });
    window.addEventListener("touchmove", handleUserInput, { passive: true });
    window.addEventListener("keydown", handleUserInput);

    return () => {
      window.removeEventListener("wheel", handleUserInput);
      window.removeEventListener("touchmove", handleUserInput);
      window.removeEventListener("keydown", handleUserInput);
    };
  }, [enabled]);

  return { state, pause, resume, controlRef };
}
