import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import path from "path";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import os from "os";

// resolves the path to your project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pageUrl = "file://" + path.resolve(__dirname, "../dist/src/index.html");

/**
 * Exports a templated video to mp4
 *
 * @param {Object} options
 * @param {string} options.templateUrl - URL to the video template
 * @param {Object} options.params - Template params
 * @param {Object} options.size
 * @param {number} options.size.width - Exported video width
 * @param {number} options.size.height - Exported video height
 * @param {number} [options.fps = 30]
 * @param {number} [options.bitrate = 5_000_000]
 */
const exportVideo = async ({
  templateUrl,
  params,
  size,
  fps = 30,
  bitrate = 5_000_000,
}) => {
  const puppeteerArgs = [
    "--disable-web-security", // no cors
    "--enable-unsafe-webgpu",
    "--enable-webgl",
    "--ignore-gpu-blacklist",
    "--disable-software-rasterizer",
    "--no-sandbox",
  ];

  const browser = await puppeteer.launch({
    args: puppeteerArgs,
    headless: true,
  });

  const page = await browser.newPage();

  // monkey patch client's console.log
  page.on("console", (msg) => console.log(`[js2video/encoder]: ${msg.text()}`));

  // open client
  await page.goto(pageUrl);

  // wait until the render function is ready
  await page.waitForFunction("window.exportVideo !== undefined");

  const outputFile = path.join(os.tmpdir(), `video-${uuidv4()}.mp4`);
  const fileHandle = await fs.open(outputFile, "w");

  // page can now call writeChunk() from its exportVideo()
  await page.exposeFunction("writeChunk", async (chunk, position) => {
    const buffer = Buffer.from(chunk);
    await fileHandle.write(buffer, 0, buffer.length, position);
  });

  const options = { templateUrl, params, size, fps, bitrate };
  await page.evaluate(async (options) => {
    // @ts-ignore
    return await window.exportVideo(options);
  }, options);

  try {
    await fileHandle.close();
  } catch (err) {
    console.warn(err);
  }

  await page.close();
  await browser.close();

  return {
    file: outputFile,
  };
};

export { exportVideo };
