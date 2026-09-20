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
