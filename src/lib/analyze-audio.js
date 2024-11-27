import { freq2bin } from "./utils";
import { cache } from "./cache";

/**
 * Transforms an array of numbers into a bell curve shape while preserving a minimum value from the original data.
 * The function applies a Gaussian transformation that peaks in the middle and gradually decreases towards the edges.
 *
 * @param {number[]} values - The input array of numbers to transform
 * @param {number} [intensity=2] - Controls how quickly values drop off from the center. Higher values create a tighter bell curve:
 *                                - 1-2: Gentle curve
 *                                - 3-4: Moderate curve
 *                                - 5+: Sharp curve
 * @param {number} [minFactor=0.2] - Minimum multiplier for values at the edges (0-1):
 *                                   - 0: Edges go to zero
 *                                   - 0.5: Edges preserve 50% of original value
 *                                   - 1: No change to values
 * @returns {number[]} A new array of the same length with values transformed into a bell curve shape
 *
 * @example
 * // Create a moderate bell curve preserving 20% of edge values
 * createBellCurvePreserving([1, 2, 3, 4, 3, 2, 1], 4, 0.2)
 * // => [0.2, 0.8, 2.4, 4, 2.4, 0.8, 0.2]
 *
 * @example
 * // Create a sharp bell curve with edges going almost to zero
 * createBellCurvePreserving([1, 2, 3, 4, 3, 2, 1], 8, 0.05)
 * // => [0.05, 0.4, 2.7, 4, 2.7, 0.4, 0.05]
 */
function smoothValues(values, intensity = 2, minFactor = 0.2) {
  const length = values.length;
  const middle = (length - 1) / 2;

  return values.map((val, i) => {
    const distance = Math.abs(i - middle) / middle;
    const factor =
      minFactor +
      (1 - minFactor) * Math.exp(-(distance * distance) * intensity);

    return val * factor;
  });
}

function compressArray(arr, targetLength) {
  // If array is shorter than target, return as is
  if (arr.length <= targetLength) return arr;

  // Calculate how many elements should go into each group
  const groupSize = arr.length / targetLength;

  return Array.from({ length: targetLength }, (_, i) => {
    const start = Math.floor(i * groupSize);
    const end = Math.floor((i + 1) * groupSize);

    // Get the slice of numbers for this group and calculate average
    const group = arr.slice(start, end);
    return group.reduce((sum, num) => sum + num, 0) / group.length;
  });
}

const analyzeAudio = async ({
  audioUrl,
  fftSize = 16384,
  minDb = -90,
  maxDb = -10,
  audioSmoothing = 0.2,
  fps = 30,
  minFreq = 0,
  maxFreq = 800,
  numberOfBins = 64,
}) => {
  const cacheKey = [
    audioUrl,
    fftSize,
    minDb,
    maxDb,
    audioSmoothing,
    fps,
    minFreq,
    maxFreq,
    numberOfBins,
  ].join(",");

  let result = await cache.get(cacheKey);

  if (result) {
    console.log("analyzed audio found in cache");
    return result;
  } else {
    console.log("analyzed audio not found in cache");
  }

  const arrayBuffer = await fetch(audioUrl).then((res) => res.arrayBuffer());

  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const bins = [];

  const offlineContext = new OfflineAudioContext(
    2,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const bufferSource = offlineContext.createBufferSource();
  bufferSource.buffer = audioBuffer;

  const analyzer = offlineContext.createAnalyser();
  analyzer.fftSize = fftSize;
  analyzer.minDecibels = minDb;
  analyzer.maxDecibels = maxDb;
  analyzer.smoothingTimeConstant = audioSmoothing;

  analyzer.connect(offlineContext.destination);
  bufferSource.connect(analyzer);

  let index = 0;
  let frames = Math.ceil(audioBuffer.duration * fps);
  let frameDuration = 1 / fps;

  const raw = new Uint8Array(analyzer.frequencyBinCount);

  const onSuspend = () => {
    return new Promise((resolve, reject) => {
      const currentTime = frameDuration * (index + 1);
      analyzer.getByteFrequencyData(raw);
      const startBin = freq2bin(
        minFreq,
        audioBuffer.sampleRate,
        analyzer.fftSize
      );
      const endBin = freq2bin(
        maxFreq,
        audioBuffer.sampleRate,
        analyzer.fftSize
      );
      const spectrum = raw.slice(startBin, endBin);
      const binsArray = compressArray(spectrum, numberOfBins);
      const normalizedBinsArray = binsArray.map((value) => value / 255);
      bins.push(smoothValues(normalizedBinsArray));
      if (index < frames) {
        if (currentTime < audioBuffer.duration) {
          offlineContext.suspend(currentTime).then(onSuspend);
        }
        offlineContext.resume();
      }
      index += 1;
      resolve();
    });
  };

  offlineContext.suspend(0).then(onSuspend);
  bufferSource.start(0);
  await offlineContext.startRendering();

  result = { bins, fps };

  await cache.set(cacheKey, result);

  return result;
};

export { analyzeAudio };
