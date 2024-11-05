import { gsap } from "gsap";
import * as Pixi from "pixi.js";
import * as PixiFilters from "pixi-filters";
import * as Fabric from "fabric";
import * as utils from "./utils";
import * as fabricUtils from "./fabric-utils";
import { encodeVideo } from "./encode-video";

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
   * @param {Object} [options.size] - Video dimensions.
   * @param {number} [options.size.width] - Video width. Default: 1920.
   * @param {number} [options.size.height] - Video height. Default: 1080.
   * @param {number} [options.fps] - Video fps. Default: 30.
   * @param {number} [options.bitrate] - Video bitrate when exporting. Default: 5_000_000.
   * @param {boolean} [options.autoPlay] - Play video immediately after loading? Default: false.
   * @param {boolean} [options.loop] - Loop the video? Default: false.
   * @param {boolean} [options.enableUnsecureMode] - Enables the template to be loaded and executed from outside an iframe. Use with caution, and only set to 'true' if you trust the template code as it enables code execution on the current page. Default: false.
   * @param {boolean} [options.isExporting] - Are we exporting this video? Default: false.
   */
  async load({
    templateUrl,
    params = {},
    size = { width: 1920, height: 1080 },
    fps = 30,
    bitrate = 5_000_000,
    parentElement,
    autoPlay = false,
    loop = false,
    enableUnsecureMode = false,
    isExporting = false,
  }) {
    this.templateUrl = templateUrl;
    this.params = params;
    this.size = size;
    this.fps = fps;
    this.bitrate = bitrate;
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
      this.canvas.renderAll();
      this.sendEvent();
    });

    this.timeline.eventCallback("onComplete", async () => {
      if (loop) {
        await this.rewind();
        this.play();
      }
      this.sendEvent();
    });

    // resize canvas
    this.canvas.setDimensions(this.size);

    // set gsap fps
    gsap.ticker.fps(this.fps);

    try {
      // import video template from url/path
      const { template, defaultParams } = await import(
        /* @vite-ignore */ this.templateUrl
      );

      this.params = { ...defaultParams, ...params };

      // execute template function
      await template({
        timeline: this.timeline,
        canvas: this.canvas,
        canvasElement: this.canvasElement,
        params: this.params,
        size: this.size,
        fps: this.fps,
        Fabric,
        Pixi,
        PixiFilters,
        utils,
        fabricUtils,
      });
    } catch (e) {
      console.error(e);
      // display error message in the canvas itself.
      const errorText = new Fabric.FabricText(
        "Template error. See error logs in console",
        {
          fontSize: this.size.height * 0.045,
          fill: "white",
          left: 20,
          top: 20,
          fontFamily: "monospace",
        }
      );
      this.canvas.set({ backgroundColor: "#cc0000" });
      this.canvas.add(errorText);
    }

    // puppeteer doesn't use a parent element
    if (this.parentElement) {
      this.wrapper = document.createElement("div");
      this.wrapper.style.cssText =
        "position: absolute; inset: 0; overflow: hidden; display: flex; align-items: center; justify-content: center";
      this.wrapper.appendChild(this.canvasElement);
      this.parentElement.appendChild(this.wrapper);

      this.resizeHandler = () => {
        const rect = this.wrapper.getBoundingClientRect();
        const scale = utils.scaleToFit(
          this.size.width,
          this.size.height,
          rect.width,
          rect.height,
          0,
          1
        );
        this.canvasElement.style.width = this.size.width * scale + "px";
        this.canvasElement.style.height = this.size.height * scale + "px";
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

    this.canvas.renderAll();
    this.sendEvent();

    if (autoPlay) {
      this.play();
    }
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
      bitrate: this.bitrate,
      width: this.size.width,
      height: this.size.height,
      canvasElement: this.canvasElement,
      seek: async (/** @type {number} */ time) => await this.seek(time),
      fps: this.fps,
      timeline: this.timeline,
      isPuppeteer,
    });
    await this.dispose();
  }

  /**
   * Dispose of all objects on the canvas.
   * @returns {Promise<void>} - A promise that resolves when all objects have been disposed of.
   */
  async dispose() {
    console.log("dispose video template");
    try {
      this.timeline.clear();
      await Promise.all(
        this.getJS2VideoObjects().map((obj) => {
          return obj.__dispose();
        })
      );
      this.canvas.clear();
      await this.canvas.dispose();
      if (this.wrapper) {
        this.wrapper.remove();
      }
      if (this.resizeHandler) {
        window.removeEventListener("resize", this.resizeHandler);
      }
      console.log("disposed video template");
    } catch (e) {
      console.error("error disposing", e.message);
    }
  }
}

export { VideoTemplate };
