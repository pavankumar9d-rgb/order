const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT_DIR = "c:\\Users\\saipa\\OneDrive\\Desktop\\hyd to del";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const FFMPEG_PATH = "C:\\Users\\saipa\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe";

async function run() {
  console.log("==================================================");
  console.log("  Pavan Express 4K 16:9 Showcase Recording");
  console.log("==================================================");

  const tempVideoDir = path.join(PROJECT_DIR, ".temp_recording");
  if (!fs.existsSync(tempVideoDir)) {
    fs.mkdirSync(tempVideoDir, { recursive: true });
  }

  console.log("1. Launching Chrome with hardware WebGL acceleration...");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      "--hide-scrollbars",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--use-gl=angle",
      "--enable-accelerated-video-decode",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding"
    ]
  });

  // Retina 4K recording setup (1920x1080 @ 2x device scale = 3840x2160 crisp resolution)
  console.log("2. Creating 4K 16:9 recording context...");
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  console.log("3. Navigating to live website (http://127.0.0.1:3000)...");
  await page.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded", timeout: 30000 });

  // Hide scrollbar tracks for cinematic purity
  await page.addStyleTag({
    content: `
      ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
      * { scrollbar-width: none !important; }
    `
  });

  console.log("4. Running butter-smooth in-browser showcase sequence (~42s total)...");
  const duration = await page.evaluate(async () => {
    const t0 = performance.now();

    // PHASE 1: Wait for Intro Loader to finish scanning and lift up
    await new Promise((resolve) => {
      if (window.__dakIntroDone) return resolve();
      window.addEventListener("dak:intro-done", resolve, { once: true });
      setTimeout(resolve, 3800);
    });

    // PHASE 2: Hold on Top Hero for 1.5 seconds
    await new Promise((r) => setTimeout(r, 1500));

    const getMaxScroll = () =>
      Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        document.body.scrollHeight - window.innerHeight
      );

    let maxScroll = getMaxScroll();

    // PHASE 3: Butter-Smooth Downward Continuous Scroll (22 Seconds)
    const DOWN_DURATION = 22000;
    await new Promise((resolve) => {
      const downStart = performance.now();
      function step(now) {
        const elapsed = now - downStart;
        const p = Math.min(1, elapsed / DOWN_DURATION);
        maxScroll = getMaxScroll();
        window.scrollTo(0, p * maxScroll);
        window.dispatchEvent(new Event("scroll"));
        if (window.ScrollTrigger && window.ScrollTrigger.update) {
          window.ScrollTrigger.update();
        }
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });

    // PHASE 4: Hold at Footer / Last Phase for 2.5 Seconds
    window.scrollTo(0, getMaxScroll());
    window.dispatchEvent(new Event("scroll"));
    await new Promise((r) => setTimeout(r, 2500));

    // PHASE 5: Smooth 10-Second Reverse Scroll Back from Last to First
    const REVERSE_DURATION = 10000;
    await new Promise((resolve) => {
      const revStart = performance.now();
      const startScrollY = getMaxScroll();
      function step(now) {
        const elapsed = now - revStart;
        const p = Math.min(1, elapsed / REVERSE_DURATION);
        // Smooth cubic ease-in-out for clear visibility across all sections
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        const targetY = (1 - ease) * startScrollY;
        window.scrollTo(0, targetY);
        window.dispatchEvent(new Event("scroll"));
        if (window.ScrollTrigger && window.ScrollTrigger.update) {
          window.ScrollTrigger.update();
        }
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          window.scrollTo(0, 0);
          window.dispatchEvent(new Event("scroll"));
          resolve();
        }
      }
      requestAnimationFrame(step);
    });

    // PHASE 6: Hold on Settled Hero for 2.0 Seconds
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("scroll"));
    await new Promise((r) => setTimeout(r, 2000));

    return performance.now() - t0;
  });

  console.log(`5. Showcase sequence finished in ${(duration / 1000).toFixed(1)} seconds!`);
  console.log("6. Finalizing video stream...");

  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const rawVideoPath = await video.path();
    console.log("7. Raw recording saved at:", rawVideoPath);

    const outputMp4 = path.join(PROJECT_DIR, "pavan_express_4k_showcase.mp4");
    console.log("8. Encoding crystal-clear 4K 60fps MP4 (3840x2160) to:", outputMp4);

    // High fidelity 4K upscale with Lanczos filter and High Profile H.264
    const cmd = `"${FFMPEG_PATH}" -y -i "${rawVideoPath}" -vf "scale=3840:2160:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -preset medium -crf 16 -r 60 "${outputMp4}"`;
    execSync(cmd, { stdio: "inherit" });

    const thumbPath = path.join(PROJECT_DIR, "pavan_express_4k_thumb.png");
    console.log("9. Extracting showcase poster thumbnail to:", thumbPath);
    const thumbCmd = `"${FFMPEG_PATH}" -y -ss 00:00:02 -i "${outputMp4}" -vframes 1 "${thumbPath}"`;
    execSync(thumbCmd, { stdio: "inherit" });

    // Clean up temporary recording folder
    try {
      fs.rmSync(tempVideoDir, { recursive: true, force: true });
    } catch (e) {}

    console.log("==================================================");
    console.log("  SHOWCASE RECORDING COMPLETE!");
    console.log("  Output File:", outputMp4);
    console.log("==================================================");
  } else {
    throw new Error("No video recording stream was captured!");
  }
}

run().catch((err) => {
  console.error("Recording error:", err);
  process.exit(1);
});
