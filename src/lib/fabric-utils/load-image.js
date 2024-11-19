import { FabricImage } from "fabric";

class JS2VideoImage extends FabricImage {
  static isJS2Video = true;
  static type = "js2video_image";

  /**
   * Create an instance of the JS2VideoImage class
   * @param {HTMLImageElement} image
   * @param {Object} options
   */
  constructor(image, options) {
    super(image, options);
  }

  async __seek() {}
  async __play() {}
  async __pause() {}
  async __startExport() {}
  async __endExport() {}

  async __dispose() {
    console.log("disposed js2video_image obj");
  }
}

async function loadImage({ url, options = {} }) {
  const image = await new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => {
      console.error(err);
      reject({ message: `Could not load image: ${url}` });
    });
    image.crossOrigin = "anonymous";
    image.src = url;
  });
  const obj = new JS2VideoImage(image, options);
  return obj;
}

export { loadImage };
