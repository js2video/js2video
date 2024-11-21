import { Textbox } from "fabric";

class JS2VideoTextbox extends Textbox {
  static isJS2Video = true;
  static type = "js2video_textbox";

  /**
   * Create an instance of the JS2VideoTextbox class
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
    console.log("disposed js2video_textbox obj");
  }
}

async function loadTextbox({ text, options = {} }) {
  const obj = new JS2VideoTextbox(text, options);
  return obj;
}

export { loadTextbox };
