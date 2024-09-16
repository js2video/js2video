import { loadVideo } from "./load-video.js";

/**
 * Exports a templated video to mp4
 *
 * @param {Object} options
 * @param {string} options.templateUrl
 * @param {Object} options.params
 * @param {Object} options.size
 * @param {number} options.size.width
 * @param {number} options.size.height
 * @param {number} [options.bitrate = 5_000_000]
 * @param {number} [options.fps = 30]
 */
const exportVideo = async ({
  templateUrl,
  params,
  size,
  fps = 30,
  bitrate = 5_000_000,
}) => {
  console.log("export video", templateUrl);
  const vc = await loadVideo({ templateUrl, params, size, fps });
  await vc.exportFile({ bitrate });
};

export { exportVideo };
