import { FabricObject } from "fabric";
import { FrameDecoder } from "../frame-decoder";

class JS2VideoVideo extends FabricObject {
  static type = "js2video_video";
  static isJS2Video = true;
  /** @type {boolean} */
  __isExporting = false;
  /** @type {FrameDecoder} */
  __frameDecoder;
  /** @type {HTMLVideoElement} */
  __video;

  /**
   * Create an instance of the JS2VideoVideo class
   * @param {HTMLVideoElement} video
   * @param {Object} options
   */
  constructor(video, options) {
    super(options);
    this.__video = video;
    super.set({
      objectCaching: false,
      selectable: false,
      width: video.videoWidth,
      height: video.videoHeight,
    });
  }

  _render(ctx) {
    ctx.drawImage(
      this.__frameDecoder ? this.__frameDecoder.canvas : this.__video,
      (this.width / 2) * -1,
      (this.height / 2) * -1
    );
  }

  /**
   * @param {number} time - time to seek to
   * @return {Promise<void>}
   */
  async __seek(time) {
    if (this.__frameDecoder) {
      await this.__frameDecoder.decode(time);
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

  async __startExport() {
    this.__isExporting = true;
    if (this.__frameDecoder) {
      console.warn(
        "had lingering framedecoder, destroying before creating new"
      );
      await this.__frameDecoder.destroy();
    }
    this.__frameDecoder = new FrameDecoder(this.__video.src);
    return;
  }

  async __endExport() {
    if (this.__frameDecoder) {
      console.log("removing frame decoder");
      try {
        await this.__frameDecoder.destroy();
      } catch (err) {
        console.warn(err);
      }
    }
    this.__frameDecoder = null;
    this.__isExporting = false;
    return;
  }

  async __dispose() {
    if (this.__frameDecoder) {
      await this.__frameDecoder.destroy();
    }
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
