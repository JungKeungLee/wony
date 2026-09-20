export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 0.85;

/** 파일 타입/용량을 검증한다. 문제가 없으면 null, 있으면 사용자에게 보여줄 메시지를 반환한다. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "JPG, PNG, WebP 파일만 업로드할 수 있습니다.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "이미지 용량은 5MB 이하만 가능합니다.";
  }
  return null;
}

function extensionFromMimeType(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

/**
 * 업로드 전 이미지를 최대 1920px로 리사이즈하고 WebP로 변환한다.
 * 브라우저가 캔버스 인코딩을 지원하지 않거나 실패하면 원본 파일을 그대로 사용한다.
 * 무거운 이미지 처리 라이브러리 없이 순수 브라우저 API(Canvas)만 사용한다.
 */
export async function prepareImageForUpload(
  file: File
): Promise<{ blob: Blob; extension: string }> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context를 만들 수 없습니다.");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
    );
    if (!blob) throw new Error("webp 인코딩에 실패했습니다.");

    return { blob, extension: "webp" };
  } catch {
    return { blob: file, extension: extensionFromMimeType(file.type) };
  }
}

const THUMBNAIL_WIDTH = 640;
const THUMBNAIL_HEIGHT = 360; // 16:9
const THUMBNAIL_QUALITY = 0.78;

interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Archive 대표 이미지처럼 작은 고정 비율 썸네일이 필요한 곳에서 쓴다. 기본값은 16:9
 * 640x360이며, Timeline처럼 4:3이 필요한 곳은 width/height를 넘겨 맞춘다. 원본 비율이
 * 다르면 찌그러뜨리지 않도록 중앙 기준으로 crop(cover)한 뒤 WebP로 인코딩한다.
 * prepareImageForUpload와 달리 항상 이 크기/비율/포맷을 강제해야 하므로 캔버스 인코딩
 * 실패 시 원본으로 폴백하지 않고 에러를 던진다.
 */
export async function prepareThumbnailForUpload(
  file: File,
  options: ThumbnailOptions = {}
): Promise<Blob> {
  const width = options.width ?? THUMBNAIL_WIDTH;
  const height = options.height ?? THUMBNAIL_HEIGHT;
  const quality = options.quality ?? THUMBNAIL_QUALITY;

  const bitmap = await createImageBitmap(file);

  const targetRatio = width / height;
  const sourceRatio = bitmap.width / bitmap.height;

  let sx = 0;
  let sy = 0;
  let sWidth = bitmap.width;
  let sHeight = bitmap.height;

  if (sourceRatio > targetRatio) {
    // 원본이 더 넓다 -> 좌우를 잘라 세로 높이에 맞춘다.
    sWidth = bitmap.height * targetRatio;
    sx = (bitmap.width - sWidth) / 2;
  } else if (sourceRatio < targetRatio) {
    // 원본이 더 좁다(세로가 길다) -> 위아래를 잘라 가로 너비에 맞춘다.
    sHeight = bitmap.width / targetRatio;
    sy = (bitmap.height - sHeight) / 2;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context를 만들 수 없습니다.");
  ctx.drawImage(bitmap, sx, sy, sWidth, sHeight, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality)
  );
  if (!blob) throw new Error("webp 인코딩에 실패했습니다.");

  return blob;
}
