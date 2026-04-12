import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { chromium } from "playwright";

const execFileAsync = promisify(execFile);

const root = resolve(process.cwd());
const demoDir = resolve(root, "demo-assets");
const rawDir = resolve(demoDir, "raw");
const finalDir = resolve(demoDir, "final");
const appUrl = process.env.DEMO_URL ?? "https://chenfangc.github.io/zombie-money/";

const narration = [
  "Zombie Money turns idle stablecoins into one simple emotional truth: your money is sleeping.",
  "Instead of starting with vaults, A P Y, and protocol jargon, it opens with one clear action: wake it up.",
  "Once tapped, the app pulls live LI.FI Earn data and surfaces one calm, stablecoin friendly route.",
  "The revive step is staged for demo reliability, so the flow stays believable and judge friendly.",
  "In a few seconds, sleeping money becomes awake money: active, earning, and tracked.",
  "Most wallets just store money. Zombie Money gives it a heartbeat.",
].join(" ");

async function run(cmd, args, options = {}) {
  return execFileAsync(cmd, args, { cwd: root, ...options });
}

async function ensureCleanDirectories() {
  await rm(demoDir, { recursive: true, force: true });
  await mkdir(rawDir, { recursive: true });
  await mkdir(finalDir, { recursive: true });
}

async function captureAppRecording() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    screen: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark",
    recordVideo: {
      dir: rawDir,
      size: { width: 430, height: 932 },
    },
  });

  const page = await context.newPage();
  await page.goto(appUrl, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /wake it up/i }).waitFor({ state: "visible" });
  await page.waitForTimeout(4500);

  await page.getByRole("button", { name: /wake it up/i }).click({ force: true });
  await page.getByRole("heading", { name: /wake-up plan/i }).waitFor({ state: "visible" });
  await page.waitForTimeout(7000);

  await page.getByRole("button", { name: /revive funds/i }).click({ force: true });
  await page.waitForTimeout(5200);
  await page.waitForTimeout(8200);

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) {
    throw new Error("Playwright did not produce a video file.");
  }

  return video.path();
}

async function synthesizeNarration() {
  const audioPath = resolve(rawDir, "narration.aiff");
  await run("say", ["-v", "Samantha", narration, "-o", audioPath]);
  return audioPath;
}

async function transcodeScreenRecording(recordingPath) {
  const appClipPath = resolve(rawDir, "app-clip.mp4");

  await run("ffmpeg", [
    "-y",
    "-i",
    recordingPath,
    "-vf",
    "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:black",
    "-r",
    "30",
    "-pix_fmt",
    "yuv420p",
    "-c:v",
    "libx264",
    appClipPath,
  ]);

  return appClipPath;
}

async function muxNarration(videoPath, audioPath) {
  const finalVideoPath = resolve(finalDir, "zombie-money-demo.mp4");

  await run("ffmpeg", [
    "-y",
    "-i",
    videoPath,
    "-i",
    audioPath,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    finalVideoPath,
  ]);

  return finalVideoPath;
}

async function main() {
  await ensureCleanDirectories();
  await run("npx", ["playwright", "install", "chromium"]);
  const recordingPath = await captureAppRecording();
  const audioPath = await synthesizeNarration();
  const appClipPath = await transcodeScreenRecording(recordingPath);
  const finalVideoPath = await muxNarration(appClipPath, audioPath);

  process.stdout.write(`${finalVideoPath}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
