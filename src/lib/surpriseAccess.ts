const UNLOCKED_STORAGE_KEY = "surpriseUnlocked";

/** 별 7개를 모두 모아 SURPRISE/ENDING 페이지가 잠금 해제됐는지 확인한다. */
export function readSurpriseUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(UNLOCKED_STORAGE_KEY) === "true";
}

export function writeSurpriseUnlocked() {
  try {
    window.localStorage.setItem(UNLOCKED_STORAGE_KEY, "true");
  } catch {
    // 시크릿 모드 등 localStorage를 쓸 수 없는 환경에서도 이번 세션 안에서는 계속 동작해야 한다.
  }
}
