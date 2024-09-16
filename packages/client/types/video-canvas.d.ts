export class VideoCanvas {
    canvasElement: HTMLCanvasElement;
    canvas: fabric.StaticCanvas<fabric.StaticCanvasEvents>;
    timeline: gsap.core.Timeline;
    /**
     * Load a video template
     *
     * @param {Object} options
     * @param {string} options.templateUrl
     * @param {Object} options.params
     * @param {Object} options.size
     * @param {number} options.size.width
     * @param {number} options.size.height
     * @param {number} [options.fps = 30]
     */
    loadTemplate({ templateUrl, params, size, fps }: {
        templateUrl: string;
        params: any;
        size: {
            width: number;
            height: number;
        };
        fps?: number;
    }): Promise<void>;
    templateUrl: string;
    params: any;
    size: {
        width: number;
        height: number;
    };
    fps: number;
    /**
     * Plays the video
     */
    play(): void;
    /**
     * Pauses the video
     */
    pause(): void;
    /**
     * Toggles the play/pause state of the video
     */
    togglePlay(): void;
    /**
     * Seek video to a specific time
     * @param {number} time
     * @returns {Promise<number>} A promise that resolves the current time when the seek operation is complete.
     */
    seek(time: number): Promise<number>;
    /**
     * Rewinds the video
     * @returns {Promise<number>} A promise that resolves the current time (0) when the rewind operation is complete.
     */
    rewind(): Promise<number>;
    /**
     * Exports video with the specified options.
     *
     * @param {Object} options - The export options.
     * @param {number} [options.bitrate = 5_000_000] - The bitrate for the export.
     * @returns {Promise<void>} - A promise that resolves when the export is complete.
     */
    exportFile({ bitrate }: {
        bitrate?: number;
    }): Promise<void>;
}
import * as fabric from "fabric";
