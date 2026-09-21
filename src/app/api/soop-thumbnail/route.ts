import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { VIDEO_THUMBNAIL_BUCKET } from "@/lib/videoThumbnails";

/**
 * SOOP는 YouTube(hqdefault.jpg)처럼 URL 규칙만으로 썸네일을 바로 계산할 수 없어서,
 * 등록 시점에 서버에서 SOOP VOD 페이지를 대신 열어 og:image를 찾아 Storage에
 * 저장해둔다(클라이언트가 매번 실시간으로 외부 페이지를 파싱하는 방식은 CORS로
 * 막혀 있고, 저장해두는 쪽이 이후 카드 렌더링에도 훨씬 안정적이다).
 *
 * 보안: videoId는 숫자만 허용하고, 실제로 fetch하는 URL은 서버가 직접 조립한
 * vod.sooplive.co.kr 주소뿐이다 - 클라이언트가 넘긴 임의의 URL을 그대로 fetch하지
 * 않는다(SSRF 방지). 추출 실패는 전부 200 + thumbnailPath:null로 응답해서, 호출하는
 * 쪽(VideoForm)이 실패를 영상 등록 자체를 막는 에러로 취급하지 않고 자연히
 * fallback(수동 업로드 없이 등록 진행)할 수 있게 한다.
 */

const VIDEO_ID_PATTERN = /^\d+$/;
const FETCH_TIMEOUT_MS = 8000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const OG_IMAGE_PATTERNS = [
  /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
];

function extractOgImage(html: string): string | null {
  for (const pattern of OG_IMAGE_PATTERNS) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function fetchWithTimeout(url: string, headers: Record<string, string>): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function extensionFromContentType(contentType: string | null): string | null {
  if (!contentType) return null;
  if (contentType.includes("image/jpeg")) return "jpg";
  if (contentType.includes("image/png")) return "png";
  if (contentType.includes("image/webp")) return "webp";
  return null;
}

/** 실패했을 때 공통으로 쓰는 응답 - 항상 200이라 클라이언트는 등록 흐름을 그대로 이어간다. */
function noThumbnail(reason: string) {
  return NextResponse.json({ thumbnailPath: null, reason });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured) return noThumbnail("supabase-not-configured");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noThumbnail("invalid-body");
  }

  const videoId = (body as { videoId?: unknown } | null)?.videoId;
  if (typeof videoId !== "string" || !VIDEO_ID_PATTERN.test(videoId)) {
    return noThumbnail("invalid-video-id");
  }

  const pageUrl = `https://vod.sooplive.co.kr/player/${videoId}`;

  let html: string;
  try {
    const pageRes = await fetchWithTimeout(pageUrl, {
      "User-Agent": BROWSER_USER_AGENT,
      Accept: "text/html",
    });
    if (!pageRes.ok) return noThumbnail(`page-fetch-failed-${pageRes.status}`);
    html = await pageRes.text();
  } catch {
    return noThumbnail("page-fetch-error");
  }

  const ogImageUrl = extractOgImage(html);
  if (!ogImageUrl) return noThumbnail("og-image-not-found");

  let imageBuffer: ArrayBuffer;
  let contentType: string | null;
  try {
    const imageRes = await fetchWithTimeout(ogImageUrl, { "User-Agent": BROWSER_USER_AGENT });
    if (!imageRes.ok) return noThumbnail(`image-fetch-failed-${imageRes.status}`);

    contentType = imageRes.headers.get("content-type");
    const contentLength = Number(imageRes.headers.get("content-length") ?? "0");
    if (contentLength > MAX_IMAGE_BYTES) return noThumbnail("image-too-large");

    imageBuffer = await imageRes.arrayBuffer();
    if (imageBuffer.byteLength > MAX_IMAGE_BYTES) return noThumbnail("image-too-large");
  } catch {
    return noThumbnail("image-fetch-error");
  }

  const extension = extensionFromContentType(contentType);
  if (!extension) return noThumbnail("unsupported-image-type");

  const path = `soop-${videoId}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(VIDEO_THUMBNAIL_BUCKET)
    .upload(path, imageBuffer, { contentType: contentType ?? undefined, upsert: false });
  if (uploadError) return noThumbnail("storage-upload-failed");

  return NextResponse.json({ thumbnailPath: path });
}
