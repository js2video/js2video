import { FabricObject } from "fabric";
import { FrameSeeker } from "../frame-seeker";
import { JS2VideoMixin } from "./js2video-mixin";

class JS2VideoVideo extends JS2VideoMixin(FabricObject) {
  static type = "js2video_video";

  /**
   * Create an instance of the JS2VideoVideo class
   * @param {HTMLVideoElement} video
   * @param {Object} options
   */
  constructor(video, options) {
    super(options);
    this.js2video_video = video;
    this.js2video_duration = video.duration;
    this.js2video_frameSeeker = new FrameSeeker(video.src);
    super.set({
      objectCaching: false,
      width: video.videoWidth,
      height: video.videoHeight,
    });
  }

  _render(ctx) {
    super.js2video_renderImage(
      ctx,
      this.js2video_isExporting
        ? this.js2video_frameSeeker.canvas
        : this.js2video_video
    );
  }

  /**
   * @param {number} time - time to seek to
   * @return {Promise<void>}
   */
  async js2video_seek(time) {
    console.log("seek video", time);
    let success;
    if (this.js2video_isExporting) {
      await this.js2video_frameSeeker.seek(time);
    } else {
      success = await Promise.race([
        new Promise((r) => setTimeout(r, 500)),
        new Promise((resolve) => {
          this.js2video_video.requestVideoFrameCallback((now, metadata) => {
            resolve(true);
          });
          this.js2video_video.currentTime = time;
        }),
      ]);
    }
    console.log("seeked video", time, success);
    this.canvas.renderAll();
  }

  js2video_play() {
    this.js2video_video.play();
  }

  js2video_pause() {
    this.js2video_video.pause();
  }

  async js2video_startExport() {
    this.js2video_isExporting = true;
    await this.js2video_frameSeeker.start();
    return;
  }

  async js2video_endExport() {
    this.js2video_isExporting = false;
    await this.js2video_frameSeeker.stop();
    return;
  }

  async js2video_dispose() {
    await this.js2video_frameSeeker.destroy();
    console.log("disposed js2video_video obj");
  }
}

async function loadVideo({ url, options = {} }) {
  console.log("loading video object", url);
  const video = await Promise.race([
    new Promise((r) => setTimeout(r, 10000)),
    new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.addEventListener("canplaythrough", () => resolve(video), {
        once: true,
      });
      video.muted = true;
      video.loop = true;
      video.crossOrigin = "anonymous";
      video.src = url;
      video.currentTime = 0;
    }),
  ]);
  if (!video) {
    throw "Could not load video";
  }
  console.log("loaded video object", url);
  const obj = new JS2VideoVideo(video, options);
  return obj;
}

export { loadVideo };
