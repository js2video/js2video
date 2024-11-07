import { fileURLToPath } from "url";
import path from "path";
import * as fs from "fs/promises";
import os from "os";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pageUrl =
  "file://" + path.resolve(__dirname, "../../public/puppeteer.html");

/**
 * Exports a video template to MP4
 * @param {Object} options
 * @param {string} options.templateUrl - URL to the video template.
 * @param {Object} [options.params] - Video template params. Default: {}.
 * @returns {Promise<{
 *   videoBitrate: number,
 *   videoSize: { width: number, height: number },
 *   videoDuration: number,
 *   exportDuration: number,
 *   file: string
 * }>} A promise that resolves with the video metadata.
 *
 * @throws {Error} If an error occurs during video processing or retrieval.
 */
export const exportVideo = async ({ templateUrl = "", params = {} }) => {
  const start = performance.now();
  let puppeteer;

  try {
    puppeteer = await import("puppeteer");
  } catch (e) {
    console.warn(
      "Puppeteer isn't pre-installed because of the size of the package.\nPlease install puppeteer to continue:\nnpm i puppeteer"
    );
    return;
  }

  console.log("start export", {
    templateUrl,
    params,
  });

  const puppeteerArgs = [
    "--disable-web-security",
    "--enable-unsafe-webgpu",
    "--enable-webgl",
    "--ignore-gpu-blacklist",
    "--disable-software-rasterizer",
  ];

  const browser = await puppeteer.launch({
    args: puppeteerArgs,
    headless: true,
  });

  const page = await browser.newPage();

  page.on("console", (msg) => console.log(`[js2video/export]: ${msg.text()}`));

  console.log("goto", pageUrl);

  // open client
  await page.goto(pageUrl);

  console.log("opened", pageUrl);

  // wait until the render function is ready
  await page.waitForFunction("window.exportVideo !== undefined");

  console.log("export function ready");

  const outputFile = path.join(os.tmpdir(), `js2video-${nanoid()}.mp4`);
  const fileHandle = await fs.open(outputFile, "w");

  // page can now call writeChunk() from its exportVideo()
  await page.exposeFunction("writeChunk", async (chunk, position) => {
    const buffer = Buffer.from(chunk);
    await fileHandle.write(buffer, 0, buffer.length, position);
  });

  const options = {
    templateUrl,
    params,
  };

  async function destroy() {
    console.log("cleanup exporter");
    try {
      await fileHandle.close();
      await page.close();
      await browser.close();
    } catch (err) {
      console.warn(err);
    }
  }

  let exportResult;

  try {
    exportResult = await page.evaluate(async (options) => {
      // @ts-ignore
      return await window.exportVideo(options);
    }, options);
  } catch (err) {
    // cleanup + rethrow
    await destroy();
    throw err;
  }

  await destroy();

  const exportDuration = Math.round(performance.now() - start);

  return {
    ...exportResult,
    exportDuration,
    file: outputFile,
  };
};
