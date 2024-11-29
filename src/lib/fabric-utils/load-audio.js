import { FabricObject } from "fabric";
import { JS2VideoMixin } from "./js2video-mixin";
import { getAudioContext } from "../get-audio-context";
import { cache } from "../cache";

class JS2VideoAudio extends JS2VideoMixin(FabricObject) {
  static type = "js2video_audio";

  /**
   * @param {AudioBuffer} audioBuffer
   * @param {Object} options
   * @param {number} offset
   * @param {number} [duration]
   */
  constructor(audioBuffer, options, offset, duration) {
    super(options);
    this.js2video_audioBuffer = audioBuffer;
    this.js2video_offset = offset;
    this.js2video_duration =
      duration !== undefined ? duration : audioBuffer.duration;
    this.js2video_isAudioPlaying = false;
  }

  stop() {
    if (this.js2video_isAudioPlaying) {
      this.source?.stop();
      this.source?.disconnect();
      this.js2video_isAudioPlaying = false;
    }
  }

  play() {
    const currentTime = this.js2video_timeline.time();
    const delay = this.js2video_offset - currentTime;
    const duration = this.js2video_duration + Math.min(0, delay);
    if (duration <= 0) {
      return;
    }
    const ctx = getAudioContext();
    this.source = ctx.createBufferSource();
    this.source.buffer = this.js2video_audioBuffer;
    this.source.connect(ctx.destination);
    this.source.start(
      ctx.currentTime + Math.max(0, delay),
      Math.max(0, -delay),
      duration
    );
    this.js2video_isAudioPlaying = true;
  }

  js2video_play() {
    this.play();
  }

  js2video_pause() {
    this.stop();
  }

  async js2video_seek(time) {
    if (this.js2video_timeline.isActive()) {
      this.stop();
      this.play();
    }
  }

  async js2video_dispose() {
    this.stop();
    // this.js2video_audioBuffer = null;
    console.log("disposed", this.type);
  }
}

const loadAudio = async ({ url, offset = 0, duration, options = {} }) => {
  if (duration !== undefined && offset + duration <= 0) {
    throw "offset + duration must be larger than 0";
  }

  const cacheKey = ["load-audio", url, offset, duration].join(",");

  let result = await cache.get(cacheKey);

  if (result) {
    console.log("audio found in cache");
    return result;
  } else {
    console.log("audio not found in cache");
  }

  const audioContext = getAudioContext();
  const arrayBuffer = await fetch(url).then((res) => res.arrayBuffer());
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const obj = new JS2VideoAudio(audioBuffer, options, offset, duration);

  await cache.set(cacheKey, obj);

  return obj;
};

export { loadAudio };
