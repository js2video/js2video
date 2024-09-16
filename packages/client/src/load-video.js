import { VideoCanvas } from "./video-canvas.js";

/**
 * Loads a templated video
 *
 * @param {Object} options
 * @param {string} options.templateUrl
 * @param {Object} options.params
 * @param {Object} options.size
 * @param {number} options.size.width
 * @param {number} options.size.height
 * @param {number} [options.fps = 30]
 */
const loadVideo = async ({ templateUrl, params, size, fps = 30 }) => {
  const vc = new VideoCanvas();
  await vc.loadTemplate({ templateUrl, params, size, fps });
  return vc;
};

export { loadVideo };
