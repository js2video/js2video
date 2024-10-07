import { scaleToCover, scaleToFit } from "../utils.js";

/** @typedef {import('fabric').FabricObject} FabricObject */
/** @typedef {import('fabric').StaticCanvas} FabricStaticCanvas */

/**
 * Scale object to fit into canvas
 * @param {FabricObject} obj
 * @param {FabricStaticCanvas} canvas
 */
function scaleToFitCanvas(obj, canvas) {
  const scale = scaleToFit(obj.width, obj.height, canvas.width, canvas.height);
  obj.set({ scaleX: scale, scaleY: scale });
}

/**
 * Scale object to cover canvas
 * @param {FabricObject} obj
 * @param {FabricStaticCanvas} canvas
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

export { scaleToCoverCanvas, scaleToFitCanvas };
