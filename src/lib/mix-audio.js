import Crunker from "crunker";

/**
 * @typedef {Object} AudioInput
 * @property {string} url The URL of the audio resource.
 * @property {number} startTime The time (in seconds) when the audio should start.
 */

/**
 * Mix 1+ audio sources together
 * @param {Object} options
 * @param {Array<AudioInput>} options.inputs
 * @param {boolean} options.isPuppeteer
 * @returns
 */
const mixAudio = async ({ inputs, isPuppeteer }) => {
  // don't why we must do this, but I don't have a better solution :/
  let crunker;
  if (isPuppeteer) {
    crunker = new Crunker.default();
  } else {
    crunker = new Crunker();
  }

  // load buffers
  const buffers = await crunker.fetchAudio(...inputs.map((item) => item.url));

  // add silence until startTime
  const paddedBuffers = buffers.map((buffer, index) =>
    crunker.padAudio(buffer, 0, inputs[index].startTime)
  );

  // merge buffers into one
  const mergedBuffer = crunker.mergeAudio(paddedBuffers);

  // export to { blob, url, element }
  const result = crunker.export(mergedBuffer, "audio/mp3");

  // close internal audiobuffer
  crunker.close();

  return { ...result, buffer: mergedBuffer };
};

export { mixAudio };
