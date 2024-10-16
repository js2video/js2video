import { scaleToCover, scaleToFit } from "../utils.js";

/**
 * Scale object to fit into canvas
 * @param {import('fabric').FabricObject} obj
 * @param {import('fabric').StaticCanvas} canvas
 */
function scaleToFitCanvas(obj, canvas) {
  const scale = scaleToFit(obj.width, obj.height, canvas.width, canvas.height);
  obj.set({ scaleX: scale, scaleY: scale });
}

/**
 * Scale object to cover canvas
 * @param {import('fabric').FabricObject} obj
 * @param {import('fabric').StaticCanvas} canvas
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
