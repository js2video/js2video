import { FabricObject } from "fabric";
import { JS2VideoMixin } from "./js2video-mixin";
import { DotLottie } from "@lottiefiles/dotlottie-web";

class JS2VideoLottie extends JS2VideoMixin(FabricObject) {
  static type = "js2video_lottie";

  /**
   * Create an instance of the JS2VideoLottie class
   * @param {string} url
   * @param {Object} options
   */
  constructor(url, options) {
    super(options);
    super.set({ objectCaching: false });
    this.js2video_canvas = document.createElement("canvas");
    this.js2video_canvas.setAttribute("width", this.width + "px");
    this.js2video_canvas.setAttribute("height", this.height + "px");
    this.js2video_canvas.style.position = "absolute";
    this.js2video_canvas.style.left = "-99999px";
    document.body.appendChild(this.js2video_canvas);
    this.js2video_lottie = new DotLottie({
      renderConfig: {
        devicePixelRatio: 1,
        freezeOnOffscreen: false,
      },
      autoplay: false,
      loop: true,
      canvas: this.js2video_canvas,
      src: url,
    });
  }

  async load() {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  async js2video_seek(time) {
    if (!this.js2video_lottie.duration) {
      return;
    }
    const progress = (time / this.js2video_lottie.duration) % 1;
    this.js2video_scrub(progress);
  }

  js2video_scrub(progress) {
    if (!this.js2video_lottie.duration) {
      return;
    }
    this.js2video_lottie.setFrame(
      Math.round(progress * this.js2video_lottie.totalFrames)
    );
  }

  js2video_play() {
    this.js2video_lottie.unfreeze();
    this.js2video_lottie.play();
  }

  js2video_pause() {
    // this.js2video_lottie.freeze();
    this.js2video_lottie.pause();
  }

  _render(ctx) {
    super.js2video_renderImage(ctx, this.js2video_canvas);
  }

  async js2video_dispose() {
    this.js2video_lottie.destroy();
    this.js2video_canvas?.remove();
    console.log("disposed", this.type);
  }
}

async function loadLottie({ url, options = {} }) {
  const obj = new JS2VideoLottie(url, options);
  await obj.load();
  return obj;
}

export { loadLottie };
