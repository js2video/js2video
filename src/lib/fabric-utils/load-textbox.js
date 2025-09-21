import { Textbox } from "fabric";
import { JS2VideoMixin } from "./js2video-mixin";

class JS2VideoTextbox extends JS2VideoMixin(Textbox) {
  static type = "js2video_textbox";

  constructor(text, options) {
    super(text, options);
    super.set({ objectCaching: false });
  }
}

async function loadTextbox({ text, options = {} }) {
  const obj = new JS2VideoTextbox(text, options);
  return obj;
}

export { loadTextbox, JS2VideoTextbox };
