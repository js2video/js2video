import { FabricObject } from "fabric";
import { JS2VideoMixin } from "./js2video-mixin";
import { getAudioContext } from "../get-audio-context";
import { cache } from "../cache";
import { getCrunker } from "../utils";

class JS2VideoAudio extends JS2VideoMixin(FabricObject) {
  static type = "js2video_audio";

  /**
   * @param {AudioBuffer} audioBuffer
   * @param {Object} options
   */
  constructor(audioBuffer, options) {
    super(options);
    this.js2video_audioBuffer = audioBuffer;
    this.js2video_duration = audioBuffer.duration;
    this.js2video_isAudioPlaying = false;
    this.js2video_gain = options.gain ?? 1;
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
    const delay = -currentTime;
    const duration = this.js2video_duration + Math.min(0, delay);
    if (duration <= 0) {
      return;
    }
    const ctx = getAudioContext();
    this.source = ctx.createBufferSource();
    this.source.buffer = this.js2video_audioBuffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = this.js2video_gain;
    this.source.connect(gainNode).connect(ctx.destination);

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

/**
 * Loads an audio file and returns a JS2VideoAudio object with optional offset and volume level.
 *
 * @param {Object} params
 * @param {string} params.url - URL of the audio file to load.
 * @param {Object} [params.video=null] - Optional video object; if provided, uses its `src` as the audio URL.
 * @param {Object} [params.options] - Options for audio manipulation.
 * @param {number|null} [params.options.offset=0] - Offset (in seconds) to pad or trim the audio. Positive = delay, negative = trim.
 * @param {number} [params.options.gain=1] - Volume level as linear gain (0 = silent, 1 = original volume, >1 = louder).
 * @returns {Promise<JS2VideoAudio>} The loaded and configured audio object.
 */
const loadAudio = async ({
  url,
  video = null,
  options = {
    offset: 0,
    gain: 1,
  },
}) => {
  if (video) {
    url = video.js2video_video.src;
  }

  const cacheKey = ["load-audio", url].join(",");

  let audioBuffer = await cache.get(cacheKey);

  if (!audioBuffer) {
    const audioContext = getAudioContext();
    const arrayBuffer = await fetch(url).then((res) => res.arrayBuffer());
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    await cache.set(cacheKey, audioBuffer);
  }

  let offsetBuffer;

  if (options.offset > 0) {
    const crunker = getCrunker();
    offsetBuffer = crunker.padAudio(audioBuffer, 0, options.offset);
    crunker.close();
  } else if (options.offset < 0) {
    const crunker = getCrunker();
    offsetBuffer = crunker.sliceAudio(
      audioBuffer,
      -options.offset,
      audioBuffer.duration - -options.offset
    );
    crunker.close();
  } else {
    offsetBuffer = audioBuffer;
  }

  const obj = new JS2VideoAudio(offsetBuffer, options);
  return obj;
};

export { loadAudio };
