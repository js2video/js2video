import { VideoTemplate } from "../dist/index.client.js";

addEventListener("DOMContentLoaded", async () => {
  let vt;

  async function exportVideo({ templateUrl, params, size, fps, bitrate }) {
    vt = new VideoTemplate();
    await vt.load({
      templateUrl,
      params,
      size,
      fps,
      enableUnsecureMode: true,
      parentId: null,
      autoPlay: false,
      loop: false,
    });
    await vt.export({ bitrate, isPuppeteer: true });
  }

  // called by puppeteer!
  window.exportVideo = exportVideo;
});
