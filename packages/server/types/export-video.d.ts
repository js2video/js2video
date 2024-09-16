/**
 * Exports a templated video to mp4
 *
 * @param {Object} options
 * @param {string} options.templateUrl - URL to the video template
 * @param {Object} options.params - Template params
 * @param {Object} options.size
 * @param {number} options.size.width - Exported video width
 * @param {number} options.size.height - Exported video height
 * @param {number} [options.fps = 30]
 * @param {number} [options.bitrate = 5_000_000]
 */
export function exportVideo({ templateUrl, params, size, fps, bitrate, }: {
    templateUrl: string;
    params: any;
    size: {
        width: number;
        height: number;
    };
    fps?: number;
    bitrate?: number;
}): Promise<{
    file: string;
}>;
