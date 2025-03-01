import { Application, Texture, Container, Sprite } from "pixi.js";
import { FabricObject } from "fabric";
import { JS2VideoMixin } from "./js2video-mixin";

class JS2VideoPixiFilter extends JS2VideoMixin(FabricObject) {
  static type = "js2video_pixi_filters";

  /**
   * @param {Object} options
   */
  constructor(canvas, filters, options) {
    super({ ...options, objectCaching: false });
    this.js2video_canvas = document.createElement("canvas");
    this.js2video_canvas.style.background = "none";
    this.js2video_app = new Application();
    this.js2video_texture = Texture.from(canvas.getElement());
    this.js2video_width = canvas.width;
    this.js2video_height = canvas.height;
    const container = new Container();
    const sprite = new Sprite(this.js2video_texture);
    sprite.scale.x = canvas.width / sprite.width;
    sprite.scale.y = canvas.height / sprite.height;
    container.addChild(sprite);
    container.filters = filters;
    this.js2video_app.stage.addChild(container);
    this.set({ width: this.js2video_width, height: this.js2video_height });
  }

  async load() {
    await this.js2video_app.init({
      autoStart: false,
      canvas: this.js2video_canvas,
      autoDensity: true,
      antialias: true,
      resolution: 1,
      backgroundAlpha: 0,
      width: this.js2video_width,
      height: this.js2video_height,
      clearBeforeRender: true,
    });
    console.log(this.js2video_app.renderer.name);
  }

  _render(ctx) {
    this.js2video_texture.source.update();
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

async function loadPixiFilters({ canvas, filters = [], options = {} }) {
  const obj = new JS2VideoPixiFilter(canvas, filters, options);
  await obj.load();
  return obj;
}

export { loadPixiFilters };
