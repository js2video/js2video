import { FabricObject } from "fabric";

class JS2VideoAudio extends FabricObject {
  static type = "js2video_audio";
  static isJS2Video = true;
  /** @type {boolean} */
  __isExporting = false;
  /** @type {HTMLAudioElement} */
  __audio;

  constructor(audio, options) {
    super(options);
    this.__audio = audio;
    super.set({ objectCaching: false, selectable: true });
  }

  __play() {
    this.__audio.play();
  }

  __pause() {
    this.__audio.pause();
  }

  /**
   * @param {number} time - time to seek to
   * @return {Promise<void>}
   */
  async __seek(time) {
    if (this.__isExporting) {
      return;
    }
    return new Promise((resolve) => {
      this.__audio.addEventListener("seeked", () => resolve(), { once: true });
      this.__audio.currentTime = time;
    });
  }

  async __startExport() {
    this.__isExporting = true;
    return;
  }

  async __endExport() {
    this.__isExporting = false;
    return;
  }

  _render(ctx) {}

  cleanup() {
    console.log("cleanup audio", this);
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
