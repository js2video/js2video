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
}

async function loadText({ text, options = {} }) {
  const obj = new JS2VideoText(text, options);
  return obj;
}

export { loadText };
