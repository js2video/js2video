import { gsap } from "gsap";
import * as Pixi from "pixi.js";
import * as PixiFilters from "pixi-filters";
import * as Fabric from "fabric";
import * as utils from "./template-utils";
import * as canvasUtils from "./fabric-utils";
import { encodeVideo } from "./encode-video";
import { validateParams } from "./validate-params";
import { getCrunker, debounceAsync } from "./utils";
import { registerGsapEffects } from "./gsap-effects/register-gsap-effects";

registerGsapEffects();

/** default params for all video templates */
const globalParams = {
  bitrate: 10_000_000,
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
  range: [0, 1],
};

/**
 * @typedef {Object} ExportResult
 * @property {number} videoBitrate - The bitrate used for the export (in kbps).
 * @property {Object} videoSize - The size of the video.
 * @property {number} videoSize.width - The width of the video.
 * @property {number} videoSize.height - The height of the video.
 * @property {number} videoDuration - The duration of the video in milliseconds.
 */

/**
 * @typedef {Object} IJS2VideoObject
 * @property {string} type
 * @property {Object} js2video_params
 * @property {gsap.core.Timeline} js2video_timeline
 * @property {Function} js2video_dispose
 * @property {Function} js2video_seek
 * @property {Function} js2video_scrub
 * @property {Function} js2video_play
 * @property {Function} js2video_pause
 * @property {Function} js2video_startExport
 * @property {Function} js2video_endExport
 * @property {boolean} js2video_isExporting
 * @property {HTMLAudioElement | undefined} [js2video_audio]
 * @property {HTMLVideoElement | undefined} [js2video_video]
 * @property {AudioBuffer | undefined} [js2video_audioBuffer]
 * @property {number | undefined} [js2video_offset]
 * @property {number | undefined} [js2video_duration]
 */

/**
 * Checks if the given object is an IJS2VideoObject.
 * @param {Object} obj - The object to check.
 * @returns {obj is IJS2VideoObject} - Returns true if the object is an IJS2VideoObject.
 */
function isJS2VideoObject(obj) {
  return obj?.constructor?.isJS2Video === true;
}

/**
 * A JS2Video class
 */
class VideoTemplate {
  /**
   * Creates an instance of the JS2Video class
   * @param {Object} options
   * @param {string} options.templateUrl - The URL to the video template.
   * @param {Object} [options.params] - Video template params. Default: {}.
   * @param {HTMLElement} [options.parentElement] - Parent element. Default: document.body.
   * @param {boolean} [options.autoPlay] - Play video immediately after loading? Default: false.
   * @param {string} [options.videoFilePrefix] - String to prefix exported video file names with. default: js2video.
   * @param {boolean} [options.loop] - Loop the video? Default: false.
   * @param {boolean} [options.enableUnsecureMode] - Enables the template to be loaded and executed from outside an iframe. Use with caution, and only set to 'true' if you trust the template code as it enables code execution on the current page. Default: false.
   */
  constructor({
    templateUrl,
    params = {},
    parentElement = document.body,
    autoPlay = false,
    loop = false,
    enableUnsecureMode = false,
    videoFilePrefix = "js2video",
  }) {
    this.templateUrl = templateUrl;
    this.params = params;
    this.parentElement = parentElement;
    this.autoPlay = autoPlay;
    this.loop = loop;
    this.enableUnsecureMode = enableUnsecureMode;
    this.videoFilePrefix = videoFilePrefix;
    /** @type {Array<IJS2VideoObject>} */
    this.objects = [];
    this.isExporting = false;
    this.isLoaded = false;
    this.isDisposed = false;
    this.isPlaying = false;
    this.range = [0, 1];
    this.timeline = gsap.timeline({ paused: true, repeat: -1 });
    this.canvasElement = document.createElement("canvas");
    this.canvas = new Fabric.StaticCanvas(this.canvasElement, {
      enableRetinaScaling: true,
    });
    this.bitrate = 6e6;
  }

  /**
   * Loads the video template instance
   *
   * @returns {Promise<void>}
   */
  async load() {
    if (this.isLoaded) {
      console.warn("This Video Template instance is already loaded");
      return;
    }

    this.isLoaded = true;

    // Throw if !enableUnsecureMode and template is loaded outside iframe
    if (!this.enableUnsecureMode && window.self === window.top) {
      console.error(
        "Error: The video template must be loaded from inside an iframe to avoid code execution on this page from the template. If you trust the content of this template or want it to execute anyway, set the option 'enableUnsecureMode' to true in the 'load' function."
      );
      return;
    }

    this.timeline.eventCallback("onUpdate", async () => {
      this.renderAll();
      this.sendEvent("timelineUpdate");
      if (this.isPlaying && this.currentTime > this.rangeEndTime) {
        await this.rewind();
      }
    });

    this.timeline.eventCallback("onRepeat", async () => {
      await this.rewind();
      this.sendEvent("timelineRepeat");
    });

    // import video template from url/path
    const { template, defaultParams } = await import(
      /* @vite-ignore */ this.templateUrl
    );

    // merge all params
    this.params = { ...globalParams, ...defaultParams, ...this.params };

    // store directly on instance
    this.bitrate = this.params.bitrate;

    validateParams(this.params);

    // update range from params
    this.setRange(this.params.range[0], this.params.range[1]);

    // set gsap fps
    gsap.ticker.fps(this.params.fps);

    // resize canvas
    this.canvas.setDimensions(this.params.size);

    // execute template function
    await template({
      timeline: this.timeline,
      canvas: this.canvas,
      canvasElement: this.canvasElement,
      params: this.params,
      Fabric,
      Pixi,
      PixiFilters,
      utils,
      canvasUtils,
    });

    if (this.duration > 3600) {
      throw "Total video duration is too long. Max duration: 1 hour";
    }

    // store all custom objects
    this.objects = this.canvas
      .getObjects()
      .filter((obj) => isJS2VideoObject(obj));

    // attach timeline and params to all custom objects
    this.objects.map((obj) => {
      obj.js2video_timeline = this.timeline;
      obj.js2video_params = this.params;
    });

    // add canvas to DOM
    this.parentElement.appendChild(this.canvasElement);

    // scale canvas to fit parent
    this.scaleToFit();

    // attach resize handler
    addEventListener("resize", this.resizeHandler.bind(this));

    // hack: forces rendering first video frame on all video objects
    await Promise.all(
      this.objects.map((obj) => {
        return obj.js2video_seek(this.rangeStartTime, this.isExporting);
      })
    );

    // render canvas
    this.renderAll();

    if (this.autoPlay) {
      this.play();
    }

    this.sendEvent("templateLoaded");

    return;
  }

  resizeHandler() {
    this.scaleToFit();
  }

  sendEvent(type = "none") {
    const message = {
      type,
      videoTemplate: this,
    };
    const ev = new CustomEvent("js2video", {
      detail: message,
    });
    window.dispatchEvent(ev);
  }

  triggerEvent(type) {
    this.sendEvent(type);
  }

  renderAll() {
    this.canvas.renderAll();
  }

  async mergeAudio() {
    const audioInputs = this.objects.filter(
      (obj) => obj.type === "js2video_audio"
    );

    if (!audioInputs.length) {
      return null;
    }

    const crunker = getCrunker();

    // merge buffers into one
    let mergedBuffer = crunker.mergeAudio(
      audioInputs.map((obj) => obj.js2video_audioBuffer)
    );

    // no need to slice
    if (
      this.rangeStartTime <= 0 &&
      this.rangeEndTime >= mergedBuffer.duration
    ) {
      console.log("no need to slice");
      return mergedBuffer;
    }

    // slice to match output length
    const outputBuffer = crunker.sliceAudio(
      mergedBuffer,
      this.rangeStartTime,
      Math.min(mergedBuffer.duration, this.rangeEndTime)
    );

    crunker.close();

    return outputBuffer;
  }

  /**
   * Scales the video canvas to fit into its parent element.
   * @returns {void}
   */
  scaleToFit() {
    if (!this.parentElement) {
      return;
    }
    const rect = this.parentElement.getBoundingClientRect();
    const scale = utils.scaleToFit(
      this.params.size.width,
      this.params.size.height,
      rect.width,
      rect.height,
      0,
      1
    );
    this.canvasElement.style.width = this.params.size.width * scale + "px";
    this.canvasElement.style.height = this.params.size.height * scale + "px";
  }

  /**
   * Starts/resumes video playback
   * @returns {void}
   */
  play() {
    if (this.isExporting) {
      return;
    }
    this.isPlaying = true;
    this.timeline.play();
    this.objects.map((obj) => {
      obj.js2video_play();
    });
    this.sendEvent("play");
  }

  /**
   * Pauses the video playback
   * @returns {void}
   */
  pause() {
    this.isPlaying = false;
    this.timeline.pause();
    this.objects.map((obj) => {
      obj.js2video_pause();
    });
    this.sendEvent("pause");
  }

  /**
   * Toggles play/pause playback
   * @returns {void}
   */
  togglePlay() {
    if (this.isExporting) {
      return;
    }
    this.isPlaying ? this.pause() : this.play();
  }

  /**
   * Seeks to a specific time in the video
   * @param {Object} options
   * @param {number} [options.time] - Time to seek to
   * @param {number} [options.progress]- Progress to seek to
   * @returns {Promise<void>}
   */
  async seek({ time, progress }) {
    if (progress) {
      time = this.progressToTime(progress);
    }
    this.timeline.time(time);
    // seek in all objects
    await Promise.all(
      this.objects.map((obj) => {
        return obj.js2video_seek(time, this.isExporting);
      })
    );
  }

  /**
   * Updates the progress of the video timeline.
   *
   * This method calls the `progress()` method of the associated `timeline`
   * with the given progress value to update the video's current position.
   *
   * @param {object} options
   * @param {number} [options.progress]
   * @param {number} [options.time]
   */
  scrub({ progress, time }) {
    if (time) {
      progress = this.timeToProgress(time);
    }
    this.timeline.progress(progress);
    this.objects.map((obj) => {
      return obj.js2video_scrub(progress);
    });
    this.#debouncedSeek({ time: this.timeline.time() });
  }

  // used in scrubber
  #debouncedSeek = debounceAsync(this.seek.bind(this), 100);

  /**
   * Rewinds the video playback to its starting position
   * @returns {Promise<void>}
   */
  async rewind() {
    return this.seek({ time: this.rangeStartTime });
  }

  async cleanupExport() {
    this.isExporting = false;
    await this.rewind();
    await Promise.all(this.objects.map((obj) => obj.js2video_endExport()));
    console.log("export ended");
  }

  /**
   * Exports the video to MP4 from the browser or server.
   *
   * @param {Object} options - The options for the export.
   * @param {AbortSignal} [options.signal] - The signal that can be used to abort the export process.
   * @param {FileSystemWritableFileStream} [options.fileStream]
   * @returns {Promise<ExportResult>}
   */
  async export({ signal, fileStream } = {}) {
    try {
      console.log("startExport");
      this.isExporting = true;

      await Promise.all(this.objects.map((obj) => obj.js2video_startExport()));
      await this.seek({ time: this.rangeStartTime });
      this.pause();

      const audioBuffer = await this.mergeAudio();

      await encodeVideo({
        audioBuffer,
        bitrate: this.bitrate,
        width: this.params.size.width,
        height: this.params.size.height,
        canvasElement: this.canvasElement,
        seek: async (/** @type {number} */ time) => {
          await this.seek({ time });
        },
        fps: this.params.fps,
        rangeStart: this.rangeStartTime,
        rangeEnd: this.rangeEndTime,
        timeline: this.timeline,
        progressHandler: () => this.sendEvent("exportProgress"),
        signal,
        fileStream,
      });

      await this.cleanupExport();
    } catch (err) {
      await this.cleanupExport();
      throw err;
    }
    const result = {
      videoBitrate: this.params.bitrate,
      videoSize: this.params.size,
      videoDuration: this.duration * 1000,
    };
    return result;
  }

  /**
   * Disposes the video template and all its resources.
   * @returns {Promise<void>}
   */
  async dispose() {
    console.log("dispose video template");

    if (this.isDisposed) {
      console.warn("This Video Template instance is already disposed");
      return;
    }

    this.isDisposed = true;

    try {
      window.removeEventListener("resize", this.resizeHandler);
      this.pause();
      this.timeline.clear();
      await Promise.all(this.objects.map((obj) => obj.js2video_dispose()));
      this.canvas.clear();
      await this.canvas.dispose();
      console.log("disposed video template");
    } catch (e) {
      console.error("error disposing", e.message);
    } finally {
      this.canvasElement.remove();
    }
  }

  setBitrate(bitrate) {
    this.bitrate = bitrate;
    this.sendEvent("setBitrate");
  }

  setRange(start, end) {
    this.range = [start, end];
    this.sendEvent("setRange");
  }

  setTimeRange(startTime, endTime) {
    if (startTime >= endTime) {
      return;
    }
    this.setRange(this.timeToProgress(startTime), this.timeToProgress(endTime));
  }

  progressToTime(progress) {
    return Math.min(progress * this.duration, this.duration);
  }

  timeToProgress(time) {
    if (!this.duration) {
      return 0;
    }
    return Math.min(time / this.duration, 1);
  }

  get duration() {
    return this.timeline.duration();
  }

  get currentTime() {
    return this.timeline.time();
  }

  get progress() {
    return this.timeline.progress();
  }

  get rangeStart() {
    return this.range[0];
  }

  get rangeEnd() {
    return this.range[1];
  }

  get rangeStartTime() {
    return this.range[0] * this.duration;
  }

  get rangeEndTime() {
    return this.range[1] * this.duration;
  }
}

export { VideoTemplate };
