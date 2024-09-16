import { exportVideo } from "@js2video/client";

window.addEventListener("DOMContentLoaded", async () => {
  // @ts-ignore
  window.exportVideo = exportVideo;
});
