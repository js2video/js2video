import { FabricImage } from "fabric";

class JS2VideoImage extends FabricImage {
  static type = "js2video_image";
  constructor(image, options) {
    super(image, options);
  }
  async _dispose() {
    console.log("disposed js2video_image obj");
  }
}

async function loadImage({ url, options }) {
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
