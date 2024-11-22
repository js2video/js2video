import { gsap } from "gsap";
import * as Pixi from "pixi.js";
import * as PixiFilters from "pixi-filters";
import * as Fabric from "fabric";
import * as utils from "./template-utils";
import * as fabricUtils from "./fabric-utils";
import { encodeVideo } from "./encode-video";
import { validateParams } from "./validate-params";
import { mixAudio } from "./mix-audio";

/** default params for all video templates */
const globalParams = {
  bitrate: 10_000_000,
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
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
 * @property {Function} __dispose
 * @property {Function} __seek
 * @property {Function} __play
 * @property {Function} __pause
 * @property {Function} __startExport
 * @property {Function} __endExport
 * @property {boolean} __isExporting
 * @property {HTMLAudioElement|undefined} [__audio]
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
  templateUrl;
  #params;
  #timeline = gsap.timeline({ paused: true });
  #canvasElement = document.createElement("canvas");
  #canvas = new Fabric.StaticCanvas(this.#canvasElement, {
    enableRetinaScaling: true,
  });
  #parentElement;
  #autoPlay;
  #loop;
  #enableUnsecureMode;
  #isExporting = false;
  #isLoaded = false;
  /** @type {Array<IJS2VideoObject>} */
  #objects = [];
  isPlaying = false;

  /**
   * Creates an instance of the JS2Video class
   * @param {Object} options
   * @param {string} options.templateUrl - The URL to the video template.
   * @param {Object} [options.params] - Video template params. Default: {}.
   * @param {HTMLElement} [options.parentElement] - Parent element. Default: document.body.
   * @param {boolean} [options.autoPlay] - Play video immediately after loading? Default: false.
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
  }) {
    this.templateUrl = templateUrl;
    this.#params = params;
    this.#parentElement = parentElement;
    this.#autoPlay = autoPlay;
    this.#loop = loop;
    this.#enableUnsecureMode = enableUnsecureMode;
  }

  /**
   * Loads the video template instance
   *
   * @returns {Promise<void>}
   */
  async load() {
    if (this.#isLoaded) {
      throw "Video Template instance was alreadey loaded";
    }

    this.#isLoaded = true;

    // Throw if !enableUnsecureMode and template is loaded outside iframe
    if (!this.#enableUnsecureMode && window.self === window.top) {
      console.error(
        "Error: The video template must be loaded from inside an iframe to avoid code execution on this page from the template. If you trust the content of this template or want it to execute anyway, set the option 'enableUnsecureMode' to true in the 'load' function."
      );
      return;
    }

    this.#timeline.eventCallback("onUpdate", () => {
      this.#renderAll();
      this.#sendEvent();
    });

    this.#timeline.eventCallback("onComplete", async () => {
      if (this.isPlaying) {
        if (this.#loop) {
          await this.rewind();
        } else {
          this.pause();
        }
      }
      this.#sendEvent();
    });

    // import video template from url/path
    const { template, defaultParams } = await import(
      /* @vite-ignore */ this.templateUrl
    );

    this.#params = { ...globalParams, ...defaultParams, ...this.#params };

    validateParams(this.#params);

    // set gsap fps
    gsap.ticker.fps(this.#params.fps);

    // resize canvas
    this.#canvas.setDimensions(this.#params.size);

    // execute template function
    await template({
      timeline: this.#timeline,
      canvas: this.#canvas,
      canvasElement: this.#canvasElement,
      params: this.#params,
      Fabric,
      Pixi,
      PixiFilters,
      utils,
      fabricUtils,
    });

    if (this.#timeline.duration() > 3600) {
      throw "Total video duration is too long. Max duration: 1 hour";
    }

    this.#objects = this.#canvas
      .getObjects()
      .filter((obj) => isJS2VideoObject(obj));

    this.#parentElement.appendChild(this.#canvasElement);

    this.scaleToFit();

    addEventListener("resize", this.#resizeHandler.bind(this));

    // forces rendering first video frame on all video objects
    await this.seek(0);

    this.#renderAll();
    this.#sendEvent();

    if (this.#autoPlay) {
      this.play();
    }

    return;
  }

  #resizeHandler() {
    this.scaleToFit();
  }

  #sendEvent() {
    const message = {
      currentTime: this.#timeline.time(),
      duration: this.#timeline.duration(),
      progress: this.#timeline.progress(),
      isPlaying: this.#timeline.isActive(),
      isExporting: this.#isExporting,
    };
    const ev = new CustomEvent("js2video", {
      detail: message,
    });
    window.dispatchEvent(ev);
  }

  triggerEvent() {
    this.#sendEvent();
  }

  #renderAll() {
    this.#canvas.renderAll();
  }

  async #mergeAudio({ isPuppeteer }) {
    const audioInputs = this.#objects
      .filter((obj) => obj.type === "js2video_audio")
      .map((obj) => ({ url: obj.__audio.src, startTime: 0 }));
    if (!audioInputs.length) {
      return null;
    }
    const result = await mixAudio({ inputs: audioInputs, isPuppeteer });
    return result;
  }

  /**
   * Scales the video canvas to fit into its parent element.
   * @returns {void}
   */
  scaleToFit() {
    if (!this.#parentElement) {
      return;
    }
    const rect = this.#parentElement.getBoundingClientRect();
    const scale = utils.scaleToFit(
      this.#params.size.width,
      this.#params.size.height,
      rect.width,
      rect.height,
      0,
      1
    );
    this.#canvasElement.style.width = this.#params.size.width * scale + "px";
    this.#canvasElement.style.height = this.#params.size.height * scale + "px";
  }

  /**
   * Starts/resumes video playback
   * @returns {void}
   */
  play() {
    this.isPlaying = true;
    this.#timeline.play();
    this.#objects.map((obj) => {
      obj.__play();
    });
    this.#sendEvent();
  }

  /**
   * Pauses the video playback
   * @returns {void}
   */
  pause() {
    this.isPlaying = false;
    this.#timeline.pause();
    this.#objects.map((obj) => {
      obj.__pause();
    });
    this.#sendEvent();
  }

  /**
   * Toggles play/pause playback
   * @returns {void}
   */
  togglePlay() {
    this.isPlaying ? this.pause() : this.play();
  }

  /**
   * Seeks to a specific time in the video
   * @param {number} time - Time to seek to
   * @returns {Promise<void>}
   */
  async seek(time) {
    // seek in all objects
    await Promise.all(
      this.#objects.map((obj) => {
        return obj.__seek(time, this.#isExporting);
      })
    );
    this.#timeline.time(time);
  }

  /**
   * Updates the progress of the video timeline.
   *
   * This method calls the `progress()` method of the associated `timeline`
   * with the given progress value to update the video's current position.
   *
   * @param {number} progress - The progress value,  between 0 and 1, representing the current position in the video timeline.
   */
  scrub(progress) {
    this.#timeline.progress(progress);
  }

  /**
   * Rewinds the video playback to its starting position
   * @returns {Promise<void>}
   */
  async rewind() {
    return this.seek(0);
  }

  async cleanupExport() {
    await this.rewind();
    await Promise.all(this.#objects.map((obj) => obj.__endExport()));
    this.#isExporting = false;
    this.#sendEvent();
    console.log("export ended");
  }

  /**
   * Exports the video to MP4 from the browser or server.
   *
   * @param {Object} options - The options for the export.
   * @param {boolean} [options.isPuppeteer] - Is this method called from puppeteer?. Default: false.
   * @returns {Promise<ExportResult>}
   */
  async export({ isPuppeteer = false }) {
    try {
      console.log("startExport");
      this.#isExporting = true;
      await Promise.all(this.#objects.map((obj) => obj.__startExport()));
      await this.rewind();
      this.pause();
      this.#sendEvent();
      const audio = await this.#mergeAudio({ isPuppeteer });
      await encodeVideo({
        audioBuffer: audio ? audio.buffer : null,
        bitrate: this.#params.bitrate,
        width: this.#params.size.width,
        height: this.#params.size.height,
        canvasElement: this.#canvasElement,
        seek: async (/** @type {number} */ time) => await this.seek(time),
        fps: this.#params.fps,
        timeline: this.#timeline,
        isPuppeteer,
        progressHandler: () => this.#sendEvent(),
      });
      await this.cleanupExport();
    } catch (err) {
      await this.cleanupExport();
      throw err;
    }
    const result = {
      videoBitrate: this.#params.bitrate,
      videoSize: this.#params.size,
      videoDuration: this.#timeline.duration() * 1000,
    };
    return result;
  }

  /**
   * Disposes the video template and all its resources.
   * @returns {Promise<void>}
   */
  async dispose() {
    console.log("dispose video template");
    try {
      window.removeEventListener("resize", this.#resizeHandler);
      this.#timeline.clear();
      await Promise.all(
        this.#objects.map((obj) => {
          return obj.__dispose();
        })
      );
      this.#canvas.clear();
      await this.#canvas.dispose();
      console.log("disposed video template");
    } catch (e) {
      console.error("error disposing", e.message);
    } finally {
      this.#canvasElement.remove();
    }
  }

  /**
   * Gets the duration of the video.
   *
   * @returns {number} The duration of the video, in seconds.
   */
  get duration() {
    return this.#timeline.duration();
  }
}

export { VideoTemplate };
