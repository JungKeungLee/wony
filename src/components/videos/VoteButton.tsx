"use client";

import { useState, type MouseEvent } from "react";
import { submitVideoVote } from "@/lib/videoVotes";

/** 성공 표시("★ 한 표가 전달됐어요 ✦")를 보여주는 시간이자, 그동안 버튼이 disabled로
 * 남아 있는 cooldown이기도 하다 - 연타로 여러 번 INSERT되는 것을 이걸로 막는다. */
const SUCCESS_COOLDOWN_MS = 1500;

type State = "idle" | "voting" | "success";

interface VoteButtonProps {
  videoId: string;
  className?: string;
}

/**
 * "이 영상에 한 표" 버튼. 같은 영상에 여러 번 투표하는 것은 의도적으로 허용하므로
 * (중복 투표 차단 없음) localStorage 등으로 "이미 투표함"을 기억하지 않는다.
 * 대신 한 번의 클릭이 여러 INSERT로 이어지거나 연타로 남용되지 않도록, 요청 중 +
 * 성공 후 짧은 cooldown 동안만 버튼을 잠근다. 투표 수는 화면 어디에도 보여주지
 * 않는다 - 이 버튼은 결과를 절대 모른다.
 */
export default function VoteButton({ videoId, className = "" }: VoteButtonProps) {
  const [state, setState] = useState<State>("idle");

  async function handleClick(e: MouseEvent<HTMLButtonElement>) {
    // 카드 전체가 클릭 가능한 영역(영상 열기) 안에 놓일 수 있어, 그 상위 핸들러로
    // 클릭이 번지지 않게 막는다.
    e.stopPropagation();
    e.preventDefault();
    if (state !== "idle") return;

    setState("voting");
    try {
      await submitVideoVote(videoId);
      setState("success");
      setTimeout(() => setState("idle"), SUCCESS_COOLDOWN_MS);
    } catch {
      // 실패하면 조용히 원래 상태로 되돌려 다시 시도할 수 있게 한다(에러 UI 없음 -
      // 투표는 가벼운 상호작용이라 실패 메시지로 부담을 주지 않는다).
      setState("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state !== "idle"}
      className={`border border-star/25 px-3 py-1.5 text-[11px] tracking-[0.1em] text-star/80 transition-colors hover:border-star hover:text-star disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      {state === "success" ? "★ 한 표가 전달됐어요 ✦" : "☆ 이 영상에 한 표"}
    </button>
  );
}
