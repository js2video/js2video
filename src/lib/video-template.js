import { gsap } from "gsap";
import * as Pixi from "pixi.js";
import * as PixiFilters from "pixi-filters";
import * as Fabric from "fabric";
import * as utils from "./utils";
import * as fabricUtils from "./fabric-utils";
import { encodeVideo } from "./encode-video";
import { validateParams } from "./validate-params";

const globalParams = {
  bitrate: 5_000_000,
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
};

/**
 * @typedef {Object} IJS2VideoObject
 * @property {Function} __dispose
 * @property {Function} __seek
 * @property {Function} __play
 * @property {Function} __pause
 * @property {boolean} __isExporting
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
 * Class representing a video template
 */
class VideoTemplate {
  /**
   * Creates a new VideoTemplate instance.
   */
  constructor() {}

  /**
   * Loads and displays a video template with params + all other options.
   * @param {Object} options
   * @param {string} options.templateUrl - URL to the video template.
   * @param {HTMLDivElement} options.parentElement - ID of the div element to put the loaded template canvas in.
   * @param {Object} [options.params] - Video template params. Default; {}.
   * @param {boolean} [options.autoPlay] - Play video immediately after loading? Default: false.
   * @param {boolean} [options.loop] - Loop the video? Default: false.
   * @param {boolean} [options.enableUnsecureMode] - Enables the template to be loaded and executed from outside an iframe. Use with caution, and only set to 'true' if you trust the template code as it enables code execution on the current page. Default: false.
   * @param {boolean} [options.isExporting] - Are we exporting this video? Default: false.
   */
  async load({
    templateUrl,
    params = {},
    parentElement,
    autoPlay = false,
    loop = false,
    enableUnsecureMode = false,
    isExporting = false,
  }) {
    this.templateUrl = templateUrl;
    this.params = params;
    this.parentElement = parentElement;
    this.canvasElement = document.createElement("canvas");
    this.isExporting = isExporting;

    // Throw if !enableUnsecureMode and template is loaded outside iframe
    if (!enableUnsecureMode && window.self === window.top) {
      console.error(
        "Error: The video template must be loaded from inside an iframe to avoid code execution on this page from the template. If you trust the content of this template or want it to execute anyway, set the option 'enableUnsecureMode' to true in the 'load' function."
      );
      return;
    }

    this.canvas = new Fabric.StaticCanvas(this.canvasElement, {
      enableRetinaScaling: true,
    });

    this.timeline = gsap.timeline({ paused: true });

    this.sendEvent = function () {
      const message = { timeline: this.timeline };
      const timelineEvent = new CustomEvent("js2video", {
        detail: message,
      });
      window.dispatchEvent(timelineEvent);
    };

    this.timeline.eventCallback("onUpdate", () => {
      this.renderAll();
      this.sendEvent();
    });

    this.timeline.eventCallback("onComplete", async () => {
      if (loop) {
        await this.rewind();
        this.play();
      }
      this.sendEvent();
    });

    // import video template from url/path
    const { template, defaultParams } = await import(
      /* @vite-ignore */ this.templateUrl
    );

    this.params = { ...globalParams, ...defaultParams, ...params };

    validateParams(this.params);

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
      fabricUtils,
    });

    // puppeteer doesn't use a parent element
    if (this.parentElement) {
      this.parentElement.appendChild(this.canvasElement);
      this.resizeHandler = () => {
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
        this.canvasElement.style.height =
          this.params.size.height * scale + "px";
      };
      this.resizeHandler();
      addEventListener("resize", this.resizeHandler);
    }

    // set the isExporting flag on all js2video objects
    this.canvas.getObjects().map((obj) => {
      if (isJS2VideoObject(obj)) {
        return (obj.__isExporting = this.isExporting);
      }
    });

    // forces rendering first video frame on all video objects
    await this.seek(0);

    this.renderAll();
    this.sendEvent();

    if (autoPlay) {
      this.play();
    }

    return;
  }

  getJS2VideoObjects() {
    return this.canvas.getObjects().filter((obj) => isJS2VideoObject(obj));
  }

  renderAll() {
    this.canvas.renderAll();
  }

  play() {
    this.timeline.play();
    this.getJS2VideoObjects().map((obj) => {
      obj.__play();
    });
    this.sendEvent();
  }

  pause() {
    this.timeline.pause();
    this.getJS2VideoObjects().map((obj) => {
      obj.__pause();
    });
    this.sendEvent();
  }

  togglePlay() {
    this.timeline.isActive() ? this.pause() : this.play();
  }

  /**
   * Seek to a specific time in the video
   * @param {number} time - Time to seek to
   */
  async seek(time) {
    // seek in all objects
    await Promise.all(
      this.getJS2VideoObjects().map((obj) => {
        return obj.__seek(time);
      })
    );
    this.timeline.time(time);
  }

  async rewind() {
    return this.seek(0);
  }

  /**
   *
   * @param {Object} options
   * @param {boolean} [options.isPuppeteer] - Is video exported from server/puppeteer? Default is false.
   */
  async export({ isPuppeteer = false }) {
    await encodeVideo({
      bitrate: this.params.bitrate,
      width: this.params.size.width,
      height: this.params.size.height,
      canvasElement: this.canvasElement,
      seek: async (/** @type {number} */ time) => await this.seek(time),
      fps: this.params.fps,
      timeline: this.timeline,
      isPuppeteer,
    });
    const result = {
      videoBitrate: this.params.bitrate,
      videoSize: this.params.size,
      videoDuration: this.timeline.duration() * 1000,
    };
    return result;
  }

  /**
   * Dispose of all objects on the canvas.
   * @returns {Promise<void>} - A promise that resolves when all objects have been disposed of.
   */
  async dispose() {
    console.log("dispose video template");
    try {
      if (this.timeline) {
        this.timeline.clear();
      }
      if (this.canvas) {
        await Promise.all(
          this.getJS2VideoObjects().map((obj) => {
            return obj.__dispose();
          })
        );
        this.canvas.clear();
        await this.canvas.dispose();
      }
      if (this.resizeHandler) {
        window.removeEventListener("resize", this.resizeHandler);
      }
      console.log("disposed video template");
    } catch (e) {
      console.error("error disposing", e.message);
    } finally {
      // remove canvas from parent
      if (this.parentElement) {
        this.parentElement.innerHTML = "";
      }
    }
  }
}

export { VideoTemplate };
