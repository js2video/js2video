import { FabricObject } from "fabric";
import { VideoRenderer } from "../video-renderer";

class JS2VideoVideo extends FabricObject {
  static isJS2Video = true;
  __isExporting = false;
  /** @type {VideoRenderer} */
  __videoRenderer;
  /** @type {HTMLVideoElement} */
  __video;
  static type = "js2video_video";

  /**
   * Create an instance of the JS2VideoVideo class
   * @param {HTMLVideoElement} video
   * @param {Object} options
   */
  constructor(video, options) {
    super(options);
    super.set({
      __video: video,
      objectCaching: false,
      selectable: false,
      width: video.videoWidth,
      height: video.videoHeight,
    });
    this.__videoRenderer = new VideoRenderer(video.src);
  }

  _render(ctx) {
    if (this.__isExporting) {
      ctx.drawImage(
        this.__videoRenderer.canvas,
        (this.width / 2) * -1,
        (this.height / 2) * -1
      );
    } else {
      ctx.drawImage(
        this.__video,
        (this.width / 2) * -1,
        (this.height / 2) * -1
      );
    }
  }

  /**
   * @param {number} time - time to seek to in video
   * @param {boolean} isExporting - are we exporting?
   * @return {Promise<void>}
   */
  async __seek(time, isExporting) {
    console.log("seek video", time, isExporting);
    this.__isExporting = isExporting;
    if (isExporting) {
      await this.__videoRenderer.render(time);
    } else {
      await new Promise((resolve) => {
        this.__video.requestVideoFrameCallback((now, metadata) => {
          resolve();
        });
        this.__video.currentTime = time + 0.001;
      });
    }
  }

  __play() {
    this.__video.play();
  }

  __pause() {
    this.__video.pause();
  }

  async __dispose() {
    console.log("disposed js2video_video obj");
  }
}

async function loadVideo({ url, options = {} }) {
  console.log("loading video object", url);
  const video = await new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.addEventListener(
      "error",
      (err) => {
        console.log(err);
        reject(err);
      },
      {
        once: true,
      }
    );
    video.addEventListener("canplay", () => resolve(video), {
      once: true,
    });
    video.muted = true;
    video.loop = true;
    video.crossOrigin = "anonymous";
    video.src = url;
    video.currentTime = 0;
  });
  const obj = new JS2VideoVideo(video, options);
  return obj;
}

export { loadVideo };
