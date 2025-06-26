import { Application, Container, Texture, Sprite, Assets } from "pixi.js";
import { FabricObject } from "fabric";
import { JS2VideoMixin } from "./js2video-mixin";

class JS2VideoPixi extends JS2VideoMixin(FabricObject) {
  static type = "js2video_pixi";

  /**
   * @param {Object} options
   */
  constructor(canvas, options) {
    super(options);
    super.set({ objectCaching: false, selectable: false });
    this.js2video_canvas = document.createElement("canvas");
    this.js2video_app = new Application();
    this.js2video_container = new Container();
    this.js2video_texture = Texture.from(canvas.getElement());
    this.js2video_canvas.style.background = "none";
  }

  async load() {
    await this.js2video_app.init({
      canvas: this.js2video_canvas,
      resolution: 1,
      backgroundAlpha: 0,
      autoDensity: true,
      width: 1920,
      height: 1080,
      antialias: true,
    });
    // this.js2video_texture = await Assets.load(
    //   "https://pixijs.com/assets/video.mp4"
    // );

    this.js2video_sprite = new Sprite(this.js2video_texture);
    this.js2video_sprite.width = 1920;
    this.js2video_sprite.height = 1080;
    this.js2video_app.stage.addChild(this.js2video_sprite);
  }

  _render(ctx) {
    // console.log(this.canvas.renderAll());
    this.js2video_texture.update();
    this.js2video_app.render();
    super.js2video_renderImage(ctx, this.js2video_canvas);
  }

  async js2video_dispose() {
    this.js2video_app.destroy(true, {
      children: true,
      texture: true,
    });
  }
}

async function loadPixi({ canvas, options = {} }) {
  /**
   * @see https://pixijs.download/release/docs/app.Application.html#init
   * @see https://pixijs.download/release/docs/rendering.SharedRendererOptions.html
   */
  const obj = new JS2VideoPixi(canvas, options);
  await obj.load();
  return obj;
}

export { loadPixi, JS2VideoPixi };
