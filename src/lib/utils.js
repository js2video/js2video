import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Crunker from "crunker";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Linearly interpolates between two values, `x` and `y`, based on the interpolation factor `a`.
 *
 * @param {number} x - The start value.
 * @param {number} y - The end value.
 * @param {number} a - The interpolation factor (should be between 0 and 1).
 * @returns {number} The interpolated value.
 */
const lerp = (x, y, a) => x * (1 - a) + y * a;

/**
 * Clamps a value within a specified range.
 *
 * This function ensures that the value `a` is between the `min` and `max` values.
 * If `a` is less than `min`, it returns `min`; if `a` is greater than `max`, it returns `max`.
 * Otherwise, it returns `a` itself.
 *
 * @param {number} a - The value to clamp.
 * @param {number} [min=0] - The lower bound of the clamp range. Defaults to 0.
 * @param {number} [max=1] - The upper bound of the clamp range. Defaults to 1.
 * @returns {number} The clamped value of `a`.
 */
const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));

/**
 * Performs inverse linear interpolation.
 *
 * This function returns the normalized value of `a` in the range `[x, y]`.
 * It calculates how far `a` is between `x` and `y` and returns a value between 0 and 1.
 *
 * @param {number} x - The start of the range.
 * @param {number} y - The end of the range.
 * @param {number} a - The value to normalize, which should lie between `x` and `y`.
 * @returns {number} A normalized value between 0 and 1 that represents where `a` lies between `x` and `y`.
 */
const invlerp = (x, y, a) => clamp((a - x) / (y - x));

/**
 * Linearly interpolates between two values, mapping from one range to another.
 *
 * This function performs the equivalent of inverse interpolation (`invlerp`), then applies linear interpolation
 * between the ranges `[x1, y1]` and `[x2, y2]`. It finds where the value `a` lies between `x1` and `y1`,
 * then maps it to the corresponding value between `x2` and `y2`.
 *
 * @param {number} x1 - The start of the original range.
 * @param {number} y1 - The end of the original range.
 * @param {number} x2 - The start of the target range.
 * @param {number} y2 - The end of the target range.
 * @param {number} a - The value to map from the range `[x1, y1]` to the range `[x2, y2]`.
 * @returns {number} The value corresponding to `a` mapped to the target range `[x2, y2]`.
 */
const range = (x1, y1, x2, y2, a) => lerp(x2, y2, invlerp(x1, y1, a));

/**
 * Scales an image (or any content) to fit within a destination area while maintaining its aspect ratio.
 *
 * The function calculates the scaling factor by determining the minimum scale factor between
 * the destination width and height based on the source's aspect ratio. It then clamps the result
 * to be within the specified minimum and maximum scale factors.
 *
 * @param {number} sourceWidth - The width of the source content (e.g., image width).
 * @param {number} sourceHeight - The height of the source content (e.g., image height).
 * @param {number} destWidth - The width of the destination area to fit the content within.
 * @param {number} destHeight - The height of the destination area to fit the content within.
 * @param {number} [min=0] - The minimum scale factor. Defaults to 0.
 * @param {number} [max=Infinity] - The maximum scale factor. Defaults to `Infinity`.
 * @returns {number} The scale factor to apply to the source content to fit it within the destination area.
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
 * Scales an image (or any content) to cover a destination area while maintaining its aspect ratio.
 *
 * The function calculates the scaling factor by determining the maximum scale factor between
 * the destination width and height based on the source's aspect ratio. This ensures the content
 * will fully cover the destination area, possibly overflowing one dimension (either width or height).
 *
 * @param {number} sourceWidth - The width of the source content (e.g., image width).
 * @param {number} sourceHeight - The height of the source content (e.g., image height).
 * @param {number} destWidth - The width of the destination area to cover.
 * @param {number} destHeight - The height of the destination area to cover.
 * @returns {number} The scale factor to apply to the source content to cover the destination area.
 */
function scaleToCover(sourceWidth, sourceHeight, destWidth, destHeight) {
  return Math.max(destWidth / sourceWidth, destHeight / sourceHeight);
}

/**
 * Loads a Google Font asynchronously.
 *
 * This function uses the `WebFont.load` method to load a specified Google Font by its name.
 * It resolves when the font is successfully loaded, and rejects if the font cannot be loaded.
 *
 * @param {string} fontName - The name of the Google Font to load.
 * @returns {Promise<void>} A promise that resolves when the font is successfully loaded, or logs an error if it fails.
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

/**
 * Formats a time duration (in seconds) into a string with hours, minutes, seconds, and fractional seconds.
 *
 * This function takes a number of seconds (which may include fractional seconds) and converts it into a
 * formatted string in the format `HH:MM:SS.ss` or `MM:SS.ss` if the duration is less than an hour.
 * The fractional seconds are displayed as two digits, and leading zeros are added to hours, minutes,
 * and seconds if necessary to maintain the proper format.
 *
 * @param {number} seconds - The time duration in seconds, which can be a floating-point number.
 * @returns {string} A string representing the time in the format `HH:MM:SS.ss` or `MM:SS.ss`.
 */
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const fractionalSeconds = Math.floor((seconds % 1) * 100);

  const paddedHours = hours.toString().padStart(2, "0");
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = remainingSeconds.toString().padStart(2, "0");
  const paddedFractionalSeconds = fractionalSeconds.toString().padStart(2, "0");

  if (hours === 0) {
    return `${paddedMinutes}:${paddedSeconds}.${paddedFractionalSeconds}`;
  }

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}.${paddedFractionalSeconds}`;
}

/**
 * Converts a string to its Base64 encoded representation.
 *
 * This function first encodes the string to a `Uint8Array` using `TextEncoder`,
 * and then converts it to a Base64 string.
 *
 * @param {string} string - The string to encode in Base64.
 * @returns {string} The Base64 encoded string.
 */
function stringToBase64(string) {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(string);
  let base64String = "";
  for (let i = 0; i < uint8Array.length; i++) {
    base64String += String.fromCharCode(uint8Array[i]);
  }
  return btoa(base64String);
}

/**
 * Converts a string to a Base64 URL-encoded data URI.
 *
 * This function uses the `stringToBase64` function to encode the string in Base64,
 * and then returns it as a data URI in the format suitable for embedding JavaScript.
 *
 * @param {string} string - The string to encode into a Base64 URL.
 * @returns {string} The Base64-encoded data URI, prefixed with `data:application/javascript;base64,`.
 */
function stringToBase64Url(string) {
  const base64 = stringToBase64(string);
  return `data:application/javascript;base64,${base64}`;
}

function canBrowserEncodeVideo() {
  return (
    typeof window.showSaveFilePicker !== "undefined" &&
    typeof window.VideoEncoder !== "undefined" &&
    typeof window.AudioEncoder !== "undefined"
  );
}

/**
 * Converts a frequency value to its corresponding bin index in a Fast Fourier Transform (FFT).
 *
 * @param {number} frequency - The frequency value to convert, in Hz.
 * @param {number} sampleRate - The sample rate (samples per second) of the audio signal.
 * @param {number} fftSize - The size of the FFT (number of bins).
 * @returns {number} The index of the bin corresponding to the given frequency.
 */
const freq2bin = (frequency, sampleRate, fftSize) => {
  return Math.round((frequency * fftSize) / sampleRate);
};

/**
 * Converts a bin index in an FFT to its corresponding frequency value.
 *
 * @param {number} binIndex - The index of the FFT bin.
 * @param {number} sampleRate - The sample rate (samples per second) of the audio signal.
 * @param {number} fftSize - The size of the FFT (number of bins).
 * @returns {number} The frequency corresponding to the given bin index, in Hz.
 */
const bin2freq = (binIndex, sampleRate, fftSize) => {
  return (binIndex * sampleRate) / fftSize;
};

/**
 * Computes a 32-bit unsigned hash of a string using the DJB2 algorithm
 * and returns the hash as a string with a "h" prefix.
 *
 * @param {string} str - The input string to hash.
 * @returns {string} The resulting hash as a string with a "h" prefix.
 */
function djb2Hash(str) {
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return "h" + (hash >>> 0); // Convert to unsigned 32-bit integer and prepend "h"
}

function isPuppeteer() {
  // @ts-ignore
  return window.isPuppeteer === true;
}

// don't know why we must do this, but I don't have a better solution :/
function getCrunker() {
  // @ts-ignore
  return isPuppeteer() ? new Crunker.default() : new Crunker();
}

function isObjectUrl(url) {
  return (
    url &&
    typeof url === "string" &&
    (url.startsWith("blob:") || url.startsWith("file:"))
  );
}

/**
 * Repeatedly calls the given function until it returns `true` or the timeout is reached.
 *
 * @param {() => Promise<boolean>} func - An asynchronous function to evaluate. It should return `true` when the condition is met.
 * @param {number} timeout - The maximum time (in milliseconds) to wait before rejecting.
 * @returns {Promise<boolean>} Resolves with `true` if the function returns `true` within the timeout, otherwise rejects with an error.
 * @throws {Error} Throws an error if the timeout is reached before the function returns `true`.
 */
async function waitFor(func, timeout) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const intervalId = setInterval(async () => {
      // Call the function
      const result = await func();
      // If the function returns true, resolve with true
      if (result === true) {
        clearInterval(intervalId);
        resolve(true);
      }
      // Check if the timeout has been reached
      if (Date.now() - startTime >= timeout) {
        clearInterval(intervalId);
        reject(new Error("waitFor timeout"));
      }
    }, 100);
  });
}

function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const max = Math.max(r, g, b);
  const scale = 255 / max;
  const brightR = Math.min(255, Math.floor(r * scale));
  const brightG = Math.min(255, Math.floor(g * scale));
  const brightB = Math.min(255, Math.floor(b * scale));
  return `rgb(${brightR}, ${brightG}, ${brightB})`;
}

/**
 * Debounces an asynchronous function, only executing it after the specified delay
 * and for the last invocation within that delay period.
 *
 * @param {Function} func - The async function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function} The debounced version of the input function.
 */
function debounceAsync(func, delay) {
  let debounceTimer = null;

  return function (...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      await func(...args);
    }, delay);
  };
}

/**
 * Converts a base64-encoded string to a Buffer.
 *
 * @param {string} base64String - The base64 string to convert.
 * @returns {Buffer} The resulting Buffer.
 */
const base64ToBuffer = (base64String) => Buffer.from(base64String, "base64");

/**
 * Converts a Buffer to a base64-encoded string.
 *
 * @param {Buffer} buffer - The Buffer to convert.
 * @returns {string} The resulting base64 string.
 */
const bufferToBase64 = (buffer) => buffer.toString("base64");

export {
  lerp,
  clamp,
  invlerp,
  range,
  scaleToFit,
  scaleToCover,
  formatTime,
  loadGoogleFont,
  cn,
  stringToBase64,
  stringToBase64Url,
  canBrowserEncodeVideo,
  freq2bin,
  bin2freq,
  djb2Hash,
  isPuppeteer,
  getCrunker,
  isObjectUrl,
  waitFor,
  randomColor,
  debounceAsync,
  base64ToBuffer,
  bufferToBase64,
};
