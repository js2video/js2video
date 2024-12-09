import { FrameDecoder } from "../frame-decoder";

const JS2VideoMixin = (Base) =>
  class extends Base {
    static isJS2Video = true;

    /** @type {FrameDecoder | undefined} */
    js2video_frameDecoder;

    /** @type {gsap.core.Timeline} */
    js2video_timeline;

    /** @type {Object} */
    js2video_params;

    /** @type {HTMLAudioElement | undefined} */
    js2video_audio;

    /** @type {HTMLVideoElement | undefined} */
    js2video_video;

    /** @type {boolean} */
    js2video_isExporting = false;

    constructor(...args) {
      super(...args);
    }

    js2video_play() {
      if (typeof super.js2video_play === "function") {
        super.js2video_play();
      }
    }

    js2video_pause() {
      if (typeof super.js2video_pause === "function") {
        super.js2video_pause();
      }
    }

    async js2video_seek(time) {
      console.log("fallback seek for", super.type);
      return;
    }

    js2video_scrub(progress) {
      return;
    }

    async js2video_startExport() {
      console.log("fallback end export for", super.type);
      return;
    }

    async js2video_endExport() {
      console.log("fallback end export for", super.type);
      return;
    }

    async js2video_dispose() {
      console.log("fallback dispose for", super.type);
      return;
    }

    js2video_renderImage(ctx, image) {
      ctx.drawImage(image, -this.width / 2, -this.height / 2);
    }
  };

export { JS2VideoMixin };
