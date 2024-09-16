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
export function loadVideo({ templateUrl, params, size, fps }: {
    templateUrl: string;
    params: any;
    size: {
        width: number;
        height: number;
    };
    fps?: number;
}): Promise<VideoCanvas>;
import { VideoCanvas } from "./video-canvas.js";
