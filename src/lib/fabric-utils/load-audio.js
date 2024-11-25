import { FabricObject } from "fabric";
import { JS2VideoMixin } from "./js2video-mixin";

class JS2VideoAudio extends JS2VideoMixin(FabricObject) {
  static type = "js2video_audio";

  /**
   *
   * @param {HTMLAudioElement} audio
   * @param {Object} options
   */
  constructor(audio, options) {
    super(options);
    this.js2video_audio = audio;
  }

  js2video_play() {
    this.js2video_audio.play();
  }

  js2video_pause() {
    this.js2video_audio.pause();
  }

  /**
   * @param {number} time - time to seek to
   * @return {Promise<void>}
   */
  async js2video_seek(time) {
    if (this.js2video_isExporting) {
      return;
    }
    return new Promise((resolve) => {
      this.js2video_audio.addEventListener("seeked", () => resolve(), {
        once: true,
      });
      this.js2video_audio.currentTime = time;
    });
  }
}

const loadAudio = async ({ url, options = {} }) => {
  const audio = await new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener("canplaythrough", () => resolve(audio));
    audio.crossOrigin = "anonymous";
    audio.src = url;
  });
  const obj = new JS2VideoAudio(audio, options);
  return obj;
};

export { loadAudio };
