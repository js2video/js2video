import { VideoTemplate } from "../server-client.js";

addEventListener("DOMContentLoaded", async () => {
  async function exportVideo({ templateUrl, params }) {
    const vt = new VideoTemplate();
    try {
      await vt.load({
        templateUrl,
        params,
        enableUnsecureMode: true,
        parentId: null,
        autoPlay: false,
        loop: false,
        isExporting: true,
      });
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
