import type { VideoItem, VideoPlatform } from "./types";
import { getVideoThumbnailUrl } from "./videoThumbnails";

interface ParsedVideoUrl {
  platform: VideoPlatform;
  videoId: string;
}

function parseYouTubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id || null;
  }

  if (host === "youtube.com") {
    if (url.pathname === "/watch") return url.searchParams.get("v");

    const shortsMatch = url.pathname.match(/^\/shorts\/([\w-]+)/);
    if (shortsMatch) return shortsMatch[1];
  }

  return null;
}

function parseSoopId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  // vod.sooplive.co.kr는 vod.sooplive.com으로 리다이렉트되므로 둘 다 허용한다.
  if (host !== "vod.sooplive.co.kr" && host !== "vod.sooplive.com") return null;

  const match = url.pathname.match(/^\/player\/(\d+)/);
  return match ? match[1] : null;
}

/** 사용자가 붙여넣은 URL에서 플랫폼과 영상 ID를 판별한다. 지원하지 않는 URL이면 null. */
export function parseVideoUrl(input: string): ParsedVideoUrl | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  const youtubeId = parseYouTubeId(url);
  if (youtubeId) return { platform: "youtube", videoId: youtubeId };

  const soopId = parseSoopId(url);
  if (soopId) return { platform: "soop", videoId: soopId };

  return null;
}

/** 카드/뱃지에 쓰는 짧은 표시명. */
export function getPlatformBadge(platform: VideoPlatform): string {
  return platform === "youtube" ? "YOUTUBE" : "SOOP";
}

/** 등록 폼에서 URL 인식 결과를 보여줄 때 쓰는 문구. */
export function getPlatformLabel(platform: VideoPlatform): string {
  return platform === "youtube" ? "YouTube 영상" : "SOOP 클립";
}

/**
 * 썸네일 URL. 공식적으로 안정된 규칙이 없는 플랫폼은 임의로 추측하지 않고 null을 반환하며,
 * 화면에서는 null일 때 공통 placeholder를 보여준다.
 */
export function getVideoThumbnail(platform: VideoPlatform, videoId: string): string | null {
  if (platform === "youtube") return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  return null;
}

/**
 * 카드/모달에서 실제로 써야 할 썸네일 URL. thumbnail_path(등록 시 자동 추출되었거나
 * 사용자가 직접 올린 대표 이미지)가 있으면 그걸 우선하고, 없으면 기존처럼
 * getVideoThumbnail()의 platform 기준 규칙(YouTube만 가능)으로 계산한다.
 * 둘 다 없으면 null - 화면에서는 기존과 동일하게 공통 placeholder를 보여준다.
 */
export function resolveVideoThumbnail(video: Pick<VideoItem, "platform" | "video_id" | "thumbnail_path">): string | null {
  if (video.thumbnail_path) return getVideoThumbnailUrl(video.thumbnail_path);
  return getVideoThumbnail(video.platform, video.video_id);
}

/**
 * 사이트 내부 iframe 재생에 쓸 embed URL.
 * 임베드가 지원되지 않는 것으로 확인되면 null을 반환하고, 화면에서는 null일 때
 * 원본 페이지로 이동하는 버튼(fallback)을 보여준다.
 */
export function getVideoEmbedUrl(platform: VideoPlatform, videoId: string): string | null {
  if (platform === "youtube") return `https://www.youtube.com/embed/${videoId}`;
  if (platform === "soop") return `https://vod.sooplive.co.kr/player/${videoId}/embed`;
  return null;
}

/** 원본 영상 페이지 URL. embed가 없을 때 새 탭으로 열어주는 용도. */
export function getVideoWatchUrl(platform: VideoPlatform, videoId: string): string {
  if (platform === "youtube") return `https://www.youtube.com/watch?v=${videoId}`;
  return `https://vod.sooplive.co.kr/player/${videoId}`;
}

/** fallback 버튼 문구. */
export function getWatchButtonLabel(platform: VideoPlatform): string {
  return platform === "youtube" ? "[ YouTube에서 보기 ]" : "[ SOOP에서 영상 보기 ]";
}
