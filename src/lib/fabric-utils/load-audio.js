import { FabricObject } from "fabric";
import { JS2VideoMixin } from "./js2video-mixin";
import { getCrunker, isObjectUrl } from "../utils";

class JS2VideoAudio extends JS2VideoMixin(FabricObject) {
  static type = "js2video_audio";

  /**
   *
   * @param {HTMLAudioElement} audio
   * @param {string} audioUrl
   * @param {Object} options
   */
  constructor(audio, audioUrl, startOffset = 0, options) {
    super(options);
    this.js2video_audioUrl = audioUrl;
    this.js2video_audio = audio;
    this.js2video_startOffset = startOffset;
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
      this.js2video_audio.currentTime = time + this.js2video_startOffset;
    });
  }

  async js2video_dispose() {
    if (isObjectUrl(this.js2video_audioUrl)) {
      URL.revokeObjectURL(this.js2video_audioUrl);
      console.log("disposed audio obj url", this.js2video_audioUrl);
    }
    console.log("disposed", this.type);
  }
}

const loadAudio = async ({
  url,
  startTime = 0,
  endTime = -1,
  startOffset = 0,
  options = {},
}) => {
  let audioUrl = url;
  // slice audio
  if (startTime >= 0 && endTime > -1 && endTime > startTime) {
    const crunker = getCrunker();
    const buffers = await crunker.fetchAudio([audioUrl]);
    const buffer = crunker.sliceAudio(buffers[0], startTime, endTime);
    const result = crunker.export(buffer, "audio/mp3");
    audioUrl = result.url;
    crunker.close();
  }
  const audio = await new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener("canplaythrough", () => resolve(audio));
    audio.crossOrigin = "anonymous";
    audio.src = audioUrl;
  });
  const obj = new JS2VideoAudio(audio, audioUrl, startOffset, options);
  return obj;
};

export { loadAudio };
