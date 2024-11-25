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
      if (typeof super.js2video_seek === "function") {
        try {
          await super.js2video_seek(time);
        } catch (err) {
          console.error(err);
        }
      }
      return;
    }

    async js2video_startExport() {
      this.js2video_isExporting = true;
      if (typeof super.js2video_startExport === "function") {
        try {
          await super.js2video_startExport();
          this.js2video_isExporting = false;
        } catch (err) {
          this.js2video_isExporting = false;
          throw err;
        }
      }
      return;
    }

    async js2video_endExport() {
      if (typeof super.js2video_endExport === "function") {
        try {
          await super.js2video_endExport();
          this.js2video_isExporting = false;
        } catch (err) {
          this.js2video_isExporting = false;
          throw err;
        }
      }
      return;
    }

    async js2video_dispose() {
      if (typeof super.js2video_dispose === "function") {
        try {
          await super.js2video_dispose();
        } catch (err) {
          console.warn(err);
        }
      }
      return;
    }
  };

export { JS2VideoMixin };
