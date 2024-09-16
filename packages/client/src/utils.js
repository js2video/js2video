import * as fabricUtils from "./fabric-utils.js";

/**
 * Linearly interpolates between two values.
 *
 * lerp(20, 80, 0.5) -> 40
 *
 * @param {number} x - The start value.
 * @param {number} y - The end value.
 * @param {number} a - The interpolation factor between 0 and 1.
 * @returns {number} The interpolated value between `x` and `y`.
 */
const lerp = (x, y, a) => x * (1 - a) + y * a;

/**
 * Clamps a value within the specified range.
 *
 * clamp(32, 20, 30) -> 30
 *
 * @param {number} a - The value to be clamped.
 * @param {number} [min=0] - The minimum value of the range. Defaults to 0.
 * @param {number} [max=1] - The maximum value of the range. Defaults to 1.
 * @returns {number} The clamped value, which is between `min` and `max`.
 */
const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));

/**
 * Inverse linear interpolation. Computes the normalized value of `a` within the range defined by `x` and `y`.
 *
 * invlerp(50, 100, 75) -> 0.5
 *
 * @param {number} x - The start value of the range.
 * @param {number} y - The end value of the range.
 * @param {number} a - The value to be normalized within the range.
 * @returns {number} The normalized value of `a`, clamped between 0 and 1.
 */
const invlerp = (x, y, a) => clamp((a - x) / (y - x));

/**
 * Maps a value `a` from one range `[x1, y1]` to another range `[x2, y2]` using linear interpolation.
 *
 * range(10, 100, 2000, 20000, 50) -> 10000
 *
 * @param {number} x1 - The start of the source range.
 * @param {number} y1 - The end of the source range.
 * @param {number} x2 - The start of the target range.
 * @param {number} y2 - The end of the target range.
 * @param {number} a - The value to be mapped from the source range to the target range.
 * @returns {number} The value mapped to the target range `[x2, y2]`.
 */
const range = (x1, y1, x2, y2, a) => lerp(x2, y2, invlerp(x1, y1, a));

/**
 * Calculates the scaling factor needed to fit a source dimension into a destination dimension while clamping the result.
 *
 * @param {number} sourceWidth - The width of the source dimension.
 * @param {number} sourceHeight - The height of the source dimension.
 * @param {number} destWidth - The width of the destination dimension.
 * @param {number} destHeight - The height of the destination dimension.
 * @param {number} [min=0] - The minimum scaling factor. Defaults to 0.
 * @param {number} [max=Infinity] - The maximum scaling factor. Defaults to Infinity.
 * @returns {number} The clamped scaling factor that fits the source dimension into the destination dimension.
 */
function scaleToFit(
  sourceWidth,
  sourceHeight,
  destWidth,
  destHeight,
  min = 0,
  max = Infinity
) {
  return clamp(
    Math.min(destWidth / sourceWidth, destHeight / sourceHeight),
    min,
    max
  );
}

/**
 * Calculates the scaling factor needed to cover a destination dimension with a source dimension.
 *
 * @param {number} sourceWidth - The width of the source dimension.
 * @param {number} sourceHeight - The height of the source dimension.
 * @param {number} destWidth - The width of the destination dimension.
 * @param {number} destHeight - The height of the destination dimension.
 * @returns {number} The scaling factor needed to cover the destination dimension.
 */
function scaleToCover(sourceWidth, sourceHeight, destWidth, destHeight) {
  return Math.max(destWidth / sourceWidth, destHeight / sourceHeight);
}

/**
 * Loads a Google font asynchronously using the WebFont loader.
 *
 * NOTE: The WebFont loader must be loaded via a a script tag in head:
 * https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js
 *
 * @param {string} fontName - The name of the Google font to load. Case sensitive!
 * @returns {Promise<void>} A promise that resolves when the font has been successfully loaded, or rejects if there was an error loading the font.
 */
async function loadGoogleFont(fontName) {
  try {
    await new Promise((resolve, reject) => {
      // @ts-ignore
      WebFont.load({
        google: {
          families: [fontName],
        },
        active: resolve,
        inactive: reject,
      });
    });
    return;
  } catch (e) {
    console.error("Could not load Google font: ", fontName);
    return;
  }
}

export {
  loadGoogleFont,
  lerp,
  clamp,
  invlerp,
  range,
  scaleToFit,
  scaleToCover,
  fabricUtils as fabric,
};
