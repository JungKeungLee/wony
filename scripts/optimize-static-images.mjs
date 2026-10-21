/**
 * Cloudflare(cloudflare 브랜치) 전용 - 빌드 시 public/ 의 큰 PNG를 같은 해상도의 WebP로
 * 변환한다(무료, 로컬 sharp 사용). 원본 PNG는 그대로 두고 옆에 .webp를 만든다.
 *
 * Workers에는 이미지 최적화가 없어(images.unoptimized: true) 원본이 그대로 전송되므로,
 * 화면에서 쓰는 경로만 .webp로 바꿔 전송량을 줄인다. 품질 90 / alpha 무손실 기준으로
 * 원본 대비 PSNR 38dB 이상, 투명 영역 차이 0을 확인했다.
 *
 * 생성물(.webp)은 .gitignore 대상이다 - cf:build / dev 실행 시 자동으로 다시 만든다.
 * 원본보다 최신인 .webp가 이미 있으면 건너뛴다.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const TARGETS = ["public/images/hero/main.png", "public/images/phone-home.png"];
const WEBP_OPTIONS = { quality: 90, alphaQuality: 100, effort: 6 };

for (const source of TARGETS) {
  const output = source.replace(/\.png$/, ".webp");
  if (fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(source).mtimeMs) {
    console.log(`[optimize-static-images] 최신 상태: ${output}`);
    continue;
  }

  const { width, height } = await sharp(source).metadata();
  await sharp(source).webp(WEBP_OPTIONS).toFile(output);
  const before = fs.statSync(source).size;
  const after = fs.statSync(output).size;
  console.log(
    `[optimize-static-images] ${path.basename(source)} ${width}x${height} ` +
      `${(before / 1024).toFixed(0)}KB -> ${path.basename(output)} ${(after / 1024).toFixed(0)}KB`
  );
}
