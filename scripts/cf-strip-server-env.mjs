/**
 * Cloudflare(cloudflare 브랜치) 전용 - `opennextjs-cloudflare build` 직후에 실행한다.
 *
 * OpenNext는 빌드 시점의 .env / .env.local 등을 전부 `.open-next/cloudflare/next-env.mjs`에
 * 복사해 Worker 번들에 포함시킨다. 그대로 두면 FULL_PREVIEW_KEY 같은 서버 전용 비밀값이
 * 배포 결과물에 박혀버린다. 실행 시점에는 Cloudflare Secret(env)이 process.env에 먼저
 * 들어가므로, 이 파일에는 브라우저 번들에 어차피 공개되는 NEXT_PUBLIC_* 값만 남긴다.
 *
 * 1) next-env.mjs에서 NEXT_PUBLIC_* 외의 키를 제거한다.
 * 2) 제거한 값이 .open-next 어디에도 남아있지 않은지 검사하고, 남아있으면 실패한다
 *    (배포 전에 빌드를 멈추기 위함). 값 자체는 절대 출력하지 않는다.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUT_DIR = path.resolve(".open-next");
const ENV_FILE = path.join(OUTPUT_DIR, "cloudflare", "next-env.mjs");
const PUBLIC_PREFIX = "NEXT_PUBLIC_";

if (!fs.existsSync(ENV_FILE)) {
  console.error(`[cf-strip-server-env] ${ENV_FILE} 가 없습니다. 먼저 opennextjs-cloudflare build를 실행하세요.`);
  process.exit(1);
}

const envModule = await import(`${pathToFileURL(ENV_FILE).href}?t=${Date.now()}`);
const removedValues = new Map();
let output = "";

for (const [mode, vars] of Object.entries(envModule)) {
  const kept = {};
  for (const [key, value] of Object.entries(vars ?? {})) {
    if (key.startsWith(PUBLIC_PREFIX)) {
      kept[key] = value;
    } else {
      if (typeof value === "string" && value.length >= 6) removedValues.set(`${mode}:${key}`, value);
    }
  }
  output += `export const ${mode} = ${JSON.stringify(kept)};\n`;
}

fs.writeFileSync(ENV_FILE, output);

const removedKeys = [...new Set([...removedValues.keys()].map((k) => k.split(":")[1]))];
console.log(
  removedKeys.length
    ? `[cf-strip-server-env] next-env.mjs에서 서버 전용 키 제거: ${removedKeys.join(", ")}`
    : "[cf-strip-server-env] 제거할 서버 전용 키가 없습니다."
);

// 2) 남은 결과물 전체에서 제거한 값이 다시 나오는지 검사한다.
// 빌드 환경변수로 FULL_PREVIEW_KEY가 잘못 들어온 경우(CI 설정 실수)도 함께 잡는다.
const buildTimeKey = process.env.FULL_PREVIEW_KEY;
if (buildTimeKey && buildTimeKey.length >= 6) removedValues.set("build:FULL_PREVIEW_KEY", buildTimeKey);
const secrets = [...new Set(removedValues.values())];
const leaks = [];

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
    } else if (entry.isFile() && fs.statSync(full).size < 50 * 1024 * 1024) {
      const content = fs.readFileSync(full, "latin1");
      if (secrets.some((secret) => content.includes(secret))) leaks.push(path.relative(OUTPUT_DIR, full));
    }
  }
}

if (secrets.length) scan(OUTPUT_DIR);

if (leaks.length) {
  console.error("[cf-strip-server-env] 서버 전용 비밀값이 빌드 결과물에 남아 있습니다 - 배포하지 마세요:");
  for (const file of leaks) console.error(`  - ${file}`);
  process.exit(1);
}

console.log("[cf-strip-server-env] 검사 통과: 서버 전용 비밀값이 빌드 결과물에 없습니다.");
