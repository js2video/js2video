import { VideoTemplate } from "../video-template.js";

addEventListener("DOMContentLoaded", async () => {
  async function exportVideo({ templateUrl, params }) {
    try {
      const vt = new VideoTemplate({
        templateUrl,
        params,
        enableUnsecureMode: true,
        autoPlay: false,
        loop: false,
        isExporting: true,
      });
      await vt.load();
      const result = await vt.export({ isPuppeteer: true });
      await vt.dispose();
      return result;
    } catch (err) {
      // cleanup and rethrow
      await vt.dispose();
      throw err;
    }
  }

  // called by puppeteer!
  window.exportVideo = exportVideo;
});
