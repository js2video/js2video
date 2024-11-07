import { VideoTemplate } from "../server-client.js";

addEventListener("DOMContentLoaded", async () => {
  async function exportVideo({ templateUrl, params, size, fps, bitrate }) {
    const vt = new VideoTemplate();
    await vt.load({
      templateUrl,
      params,
      size,
      fps,
      enableUnsecureMode: true,
      parentId: null,
      autoPlay: false,
      loop: false,
      isExporting: true,
    });
    return await vt.export({ bitrate, isPuppeteer: true });
  }

  // called by puppeteer!
  window.exportVideo = exportVideo;
});
