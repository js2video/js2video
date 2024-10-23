import { Application } from "pixi.js";
import { FabricObject } from "fabric";

class PixiObject extends FabricObject {
  static isJS2Video = true;

  /** @type {Application} */
  __pixi;
  static type = "js2video_pixi";

  /**
   *
   * @param {Application} pixi
   * @param {Object} options
   */
  constructor(pixi, options) {
    super(options);
    super.set({ __pixi: pixi, objectCaching: false, selectable: false });
  }

  _render(ctx) {
    this.__pixi.render();
    ctx.drawImage(this.__pixi, (this.width / 2) * -1, (this.height / 2) * -1);
  }

  async __seek() {}
  async __play() {}
  async __pause() {}

  async __dispose() {
    this.__pixi.destroy(true, {
      children: true,
      texture: true,
    });
    console.log("disposed js2video_pixi obj");
  }
}

/**
 * load pixi
 * @export
 */
async function loadPixi({
  backgroundAlpha = 0,
  width = 1920,
  height = 1080,
  options = {},
} = {}) {
  const canvasElement = document.createElement("canvas");
  canvasElement.style.background = "none";
  const app = new Application();
  /**
   * @see https://pixijs.download/release/docs/app.Application.html#init
   * @see https://pixijs.download/release/docs/rendering.SharedRendererOptions.html
   */
  await app.init({
    // preference: "webgpsu",
    // powerPreference: "high-performance",
    canvas: canvasElement,
    resolution: 1,
    backgroundAlpha,
    autoDensity: true,
    width,
    height,
    hello: true,
    antialias: true,
  });
  const obj = new PixiObject(app, options);
  return { obj, app };
}

export { loadPixi };
