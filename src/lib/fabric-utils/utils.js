import { scaleToFit, scaleToCover } from "../utils";

/**
 * Scale object to fit into canvas
 * @param {import('fabric').FabricObject} obj
 * @param {import('fabric').StaticCanvas} canvas
 * @param {number} [factor]
 */
function scaleToFitCanvas(obj, canvas, factor = 1) {
  const scale =
    scaleToFit(obj.width, obj.height, canvas.width, canvas.height) * factor;
  obj.set({ scaleX: scale, scaleY: scale });
}

/**
 * Scale object to cover canvas
 * @param {import('fabric').FabricObject} obj
 * @param {import('fabric').StaticCanvas} canvas
 * @param {number} [factor]
 */
function scaleToCoverCanvas(obj, canvas, factor = 1) {
  const scale =
    scaleToCover(obj.width, obj.height, canvas.width, canvas.height) * factor;
  obj.set({ scaleX: scale, scaleY: scale });
}

export { scaleToCoverCanvas, scaleToFitCanvas };
