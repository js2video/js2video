import { FabricText } from "fabric";

class JS2VideoText extends FabricText {
  static isJS2Video = true;
  static type = "js2video_text";

  /**
   * Create an instance of the JS2VideoText class
   * @param {string} text
   * @param {Object} options
   */
  constructor(text, options) {
    super(text, options);
  }

  async __seek() {}

  async __play() {}

  async __pause() {}

  async __startExport() {
    this.__isExporting = true;
    return;
  }

  async __endExport() {
    this.__isExporting = false;
    return;
  }

  async __dispose() {
    console.log("disposed js2video_text obj");
  }
}

async function loadText({ text, options = {} }) {
  const obj = new JS2VideoText(text, options);
  return obj;
}

export { loadText };
