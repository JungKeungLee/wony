/**
 * Full Preview 쿠키 서명/검증 - proxy.ts(요청 차단)와 RootLayout(화면 모드)이 반드시
 * 이 파일의 같은 함수로만 판단한다. 서버 전용(FULL_PREVIEW_KEY를 읽음) - 클라이언트
 * 컴포넌트에서 import하지 않는다.
 *
 * 예전에는 쿠키 값이 고정 문자열 "1"이라 브라우저에서 직접 넣기만 해도 비공개
 * 페이지가 열렸다. 이제 쿠키 값은 `만료시각.서명`이고, 서명은 FULL_PREVIEW_KEY로 만든
 * HMAC-SHA256이다 - 키를 모르면 유효한 쿠키를 만들 수 없고, 키 자체는 쿠키에 들어가지
 * 않는다. 키를 바꾸면 이전에 발급된 쿠키는 전부 무효가 된다.
 */

/** 서명 쿠키 유효기간(초) - 쿠키 maxAge와 서버 측 만료 검증에 같이 쓴다. */
export const PREVIEW_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30일

const SIGNING_CONTEXT = "wony-full-preview:v1";
const encoder = new TextEncoder();

function getPreviewKey(): string | null {
  const key = process.env.FULL_PREVIEW_KEY;
  return key ? key : null;
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 길이가 달라도 비교 시간이 내용에 따라 달라지지 않도록 끝까지 비교한다. */
function timingSafeEqual(a: string, b: string): boolean {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return diff === 0;
}

async function sign(key: string, expiresAt: number): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(`${SIGNING_CONTEXT}:${expiresAt}`));
  return toBase64Url(signature);
}

/** ?previewFull=값이 FULL_PREVIEW_KEY와 일치하는지. 키가 설정돼 있지 않으면 항상 false. */
export function isValidPreviewKey(suppliedKey: string | null | undefined): boolean {
  const key = getPreviewKey();
  if (!key || !suppliedKey) return false;
  return timingSafeEqual(suppliedKey, key);
}

/** 올바른 키로 들어왔을 때 심을 서명 쿠키 값. 키가 없으면 null. */
export async function createPreviewCookieValue(nowMs: number = Date.now()): Promise<string | null> {
  const key = getPreviewKey();
  if (!key) return null;
  const expiresAt = Math.floor(nowMs / 1000) + PREVIEW_COOKIE_MAX_AGE_SECONDS;
  return `${expiresAt}.${await sign(key, expiresAt)}`;
}

/** 쿠키 값이 현재 키로 서명됐고 아직 만료되지 않았는지. 형식이 틀리거나 키가 없으면 false. */
export async function verifyPreviewCookieValue(
  value: string | null | undefined,
  nowMs: number = Date.now()
): Promise<boolean> {
  const key = getPreviewKey();
  if (!key || !value) return false;

  const match = /^(\d{1,12})\.([A-Za-z0-9_-]{43})$/.exec(value);
  if (!match) return false;

  const expiresAt = Number(match[1]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(nowMs / 1000)) return false;

  return timingSafeEqual(match[2], await sign(key, expiresAt));
}
