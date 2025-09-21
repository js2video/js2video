import { FabricText } from "fabric";
import { JS2VideoMixin } from "./js2video-mixin";

class JS2VideoText extends JS2VideoMixin(FabricText) {
  static type = "js2video_text";

  /**
   * Create an instance of the JS2VideoText class
   * @param {string} text
   * @param {Object} options
   */
  constructor(text, options) {
    super(text, options);
    super.set({ objectCaching: false });
  }

  _renderBackground(ctx) {
    if (!this.customTextBackgroundColor) {
      super._renderBackground(ctx);
      return;
    }
    const dim = this._getNonTransformedDimensions();
    const padX = this.customTextBackgroundPaddingX ?? 0;
    const padY = this.customTextBackgroundPaddingy ?? 0;
    ctx.fillStyle = this.customTextBackgroundColor;
    ctx.fillRect(
      -dim.x / 2 - padX,
      -dim.y / 2 - padY,
      dim.x + padX * 2,
      dim.y + padY * 2
    );
    // if there is background color no other shadows should be cast
    this._removeShadow(ctx);
  }
}

async function loadText({ text, options = {} }) {
  const obj = new JS2VideoText(text, options);
  return obj;
}

export { loadText, JS2VideoText };
