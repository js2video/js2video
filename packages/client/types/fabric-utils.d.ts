export type FabricObject = import("fabric").FabricObject;
export type StaticCanvas = import("fabric").StaticCanvas;
export type ImageProps = import("fabric").ImageProps;
/**
 * Loads an image from a URL and creates a `FabricImage` instance with additional options.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.url - The URL of the image to load.
 * @param {ImageProps} [params.fabricOptions] - Additional options to pass to the `FabricImage` constructor.
 * @returns {Promise<FabricImage>} A promise that resolves with a `FabricImage` instance when the image is successfully loaded.
 */
export function loadImage({ url, fabricOptions }: {
    url: string;
    fabricOptions?: ImageProps;
}): Promise<FabricImage>;
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
export function scaleToFitCanvas(obj: FabricObject, canvas: StaticCanvas): void;
/**
 * Scales a Fabric.js canvas object to cover the canvas.
 * @param {FabricObject} obj - Fabric.js object.
 * @param {StaticCanvas} canvas - Fabric.js canvas.
 * @returns {void}
 */
export function scaleToCoverCanvas(obj: FabricObject, canvas: StaticCanvas): void;
import { FabricImage } from "fabric";
