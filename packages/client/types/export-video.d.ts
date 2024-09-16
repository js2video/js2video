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
export function exportVideo({ templateUrl, params, size, fps, bitrate, }: {
    templateUrl: string;
    params: any;
    size: {
        width: number;
        height: number;
    };
    bitrate?: number;
    fps?: number;
}): Promise<void>;
