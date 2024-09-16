import { gsap } from "gsap";
import * as fabric from "fabric";
import * as utils from "./utils.js";
import { encodeVideo } from "./encode-video.js";

class VideoCanvas {
  /**
   * Create an instance of the VideoCanvas class.
   */
  constructor() {
    this.canvasElement = document.createElement("canvas");
    this.canvas = new fabric.StaticCanvas(this.canvasElement, {
      enableRetinaScaling: true,
    });
    this.timeline = gsap.timeline({ paused: true });
    this.timeline.eventCallback("onUpdate", () => {
      this.canvas.renderAll();
    });
  }

  /**
   * Load a video template
   *
   * @param {Object} options
   * @param {string} options.templateUrl
   * @param {Object} options.params
   * @param {Object} options.size
   * @param {number} options.size.width
   * @param {number} options.size.height
   * @param {number} [options.fps = 30]
   */
  async loadTemplate({ templateUrl, params, size, fps = 30 }) {
    this.templateUrl = templateUrl;
    this.params = params;
    this.size = size;
    this.fps = fps;

    this.timeline.pause();
    this.timeline.time(0);
    this.timeline.clear();
    this.canvas.clear();

    // resize canvas
    this.canvas.setDimensions(this.size);

    // import video template from url/path
    const { template, defaultParams } = await import(
      /* @vite-ignore */
      this.templateUrl
    );

    await template({
      timeline: this.timeline,
      canvas: this.canvas,
      canvasElement: this.canvasElement,
      params: { ...defaultParams, ...this.params },
      fabric,
      size: this.size,
      fps: this.fps,
      utils,
    });

    this.canvas.renderAll();
  }

  /**
   * Plays the video
   */
  play() {
    this.timeline.play();
  }

  /**
   * Pauses the video
   */
  pause() {
    this.timeline.pause();
  }

  /**
   * Toggles the play/pause state of the video
   */
  togglePlay() {
    this.timeline.isActive() ? this.pause() : this.play();
  }

  /**
   * Seek video to a specific time
   * @param {number} time
   * @returns {Promise<number>} A promise that resolves the current time when the seek operation is complete.
   */
  async seek(time) {
    this.timeline.time(time);
    return this.timeline.time();
  }

  /**
   * Rewinds the video
   * @returns {Promise<number>} A promise that resolves the current time (0) when the rewind operation is complete.
   */
  async rewind() {
    return this.seek(0);
  }

  /**
   * Exports video with the specified options.
   *
   * @param {Object} options - The export options.
   * @param {number} [options.bitrate = 5_000_000] - The bitrate for the export.
   * @returns {Promise<void>} - A promise that resolves when the export is complete.
   */
  async exportFile({ bitrate = 5_000_000 }) {
    await encodeVideo({
      bitrate,
      width: this.size.width,
      height: this.size.height,
      canvasElement: this.canvasElement,
      seek: async (/** @type {number} */ time) => await this.seek(time),
      fps: this.fps,
      timeline: this.timeline,
    });
  }
}

export { VideoCanvas };
