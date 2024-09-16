import { FabricImage } from "fabric";
import { scaleToFit, scaleToCover } from "./utils.js";

/**
 * @typedef {import("fabric").FabricObject} FabricObject
 * @typedef {import("fabric").StaticCanvas} StaticCanvas
 * @typedef {import("fabric").ImageProps} ImageProps
 */

/**
 * Scales a Fabric.js canvas object to fit the canvas.
 * @param {FabricObject} obj - Fabric.js object.
 * @param {StaticCanvas} canvas - Fabric.js canvas.
 * @returns {void}
 */
function scaleToFitCanvas(obj, canvas) {
  const scale = scaleToFit(obj.width, obj.height, canvas.width, canvas.height);
  obj.set({ scaleX: scale, scaleY: scale });
}

/**
 * Scales a Fabric.js canvas object to cover the canvas.
 * @param {FabricObject} obj - Fabric.js object.
 * @param {StaticCanvas} canvas - Fabric.js canvas.
 * @returns {void}
 */
function scaleToCoverCanvas(obj, canvas) {
  const scale = scaleToCover(
    obj.width,
    obj.height,
    canvas.width,
    canvas.height
  );
  obj.set({ scaleX: scale, scaleY: scale });
}

/**
 * Loads an image from a URL and creates a `FabricImage` instance with additional options.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.url - The URL of the image to load.
 * @param {ImageProps} [params.fabricOptions] - Additional options to pass to the `FabricImage` constructor.
 * @returns {Promise<FabricImage>} A promise that resolves with a `FabricImage` instance when the image is successfully loaded.
 */
async function loadImage({ url, fabricOptions }) {
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
  const obj = new FabricImage(image, fabricOptions);
  return obj;
}

export { loadImage, scaleToFitCanvas, scaleToCoverCanvas };
