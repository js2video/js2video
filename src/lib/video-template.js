import { gsap as GSAP } from "gsap";
import * as Pixi from "pixi.js";
import * as PixiFilters from "pixi-filters";
import * as Fabric from "fabric";
import * as utils from "./utils";
import * as fabricUtils from "./fabric-utils";
import { encodeVideo } from "./encode-video";

/**
 * Class representing a video template.
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
  }) {
    this.templateUrl = templateUrl;
    this.params = params;
    this.size = size;
    this.fps = fps;
    this.bitrate = bitrate;
    this.parentElement = parentElement;
    this.canvasElement = document.createElement("canvas");

    console.log("Loading video template", templateUrl);

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

    this.timeline = GSAP.timeline({ paused: true });

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
    GSAP.ticker.fps(this.fps);

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

    this.canvas.renderAll();
    this.sendEvent();

    if (autoPlay) {
      this.play();
    }
  }

  play() {
    this.timeline.play();
    this.sendEvent();
  }

  pause() {
    this.timeline.pause();
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
      seek: async (time) => await this.seek(time),
      fps: this.fps,
      timeline: this.timeline,
      isPuppeteer,
    });
  }

  async dispose() {
    console.log("dispose video template");
    this.timeline.clear();
    await Promise.all(
      this.canvas
        .getObjects()
        .map((obj) => (obj._dispose ? obj._dispose() : null))
    );
    this.canvas.clear();
    await this.canvas.dispose();
    this.wrapper.remove();
    window.removeEventListener("resize", this.resizeHandler);
  }
}

export { VideoTemplate };
