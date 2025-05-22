import { VideoTemplate } from "../video-template.js";

window.isPuppeteer = true;

addEventListener("DOMContentLoaded", async () => {
  async function exportVideo({ templateUrl, params }) {
    let vt;
    try {
      vt = new VideoTemplate({
        templateUrl,
        params,
        enableUnsecureMode: true,
        autoPlay: false,
        loop: false,
        isExporting: true,
      });
      await vt.load();
      const result = await vt.export();
      await vt.dispose();
      return result;
    } catch (err) {
      console.error(err?.message ?? err);
      // cleanup and rethrow
      await vt.dispose();
      throw err;
    }
  }

  // called by puppeteer!
  window.exportVideo = exportVideo;
});
