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
      return;
    }

    js2video_pause() {
      return;
    }

    js2video_scrub(progress) {
      return;
    }

    async js2video_seek(time) {
      return;
    }

    async js2video_startExport() {
      return;
    }

    async js2video_endExport() {
      return;
    }

    async js2video_dispose() {
      return;
    }

    js2video_renderImage(ctx, image) {
      ctx.drawImage(image, -this.width / 2, -this.height / 2);
    }
  };

export { JS2VideoMixin };
