import React from "react";
import { JS2VideoProvider } from "./js2video-provider";
import { JS2VideoPreview } from "./js2video-preview";
import { JS2VideoControls } from "./js2video-controls";
import { JS2VideoLayout } from "./js2video-layout";

/**
 *
 * JS2Video Component
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.templateUrl - URL to the video template.
 * @param {Object} [props.params] - Video template params. Default; {}.
 * @param {Object} [props.size] - Video dimensions.
 * @param {number} [props.size.width] - Video width. Default: 1920.
 * @param {number} [props.size.height] - Video height. Default: 1080.
 * @param {number} [props.fps] - Video fps. Default: 30.
 * @param {number} [props.bitrate] - Video bitrate when exporting. Default: 5_000_000.
 * @param {boolean} [props.autoPlay] - Play video immediately after loading? Default: false.
 * @param {boolean} [props.loop] - Loop the video? Default: false.
 * @param {boolean} [props.enableUnsecureMode] - Enables the template to be loaded and executed from outside an iframe. Use with caution, and only set to 'true' if you trust the template code as it enables code execution on the current page. Default: false.
 * @returns {JSX.Element} - The video template preview wrapped a context
 */
const JS2Video = ({
  templateUrl,
  params = {},
  size = { width: 1920, height: 1080 },
  fps = 30,
  bitrate = 5_000_000,
  autoPlay = false,
  loop = false,
  enableUnsecureMode = false,
}) => {
  return (
    <JS2VideoProvider
      templateUrl={templateUrl}
      params={params}
      size={size}
      autoPlay={autoPlay}
      loop={loop}
      enableUnsecureMode={enableUnsecureMode}
      fps={fps}
      bitrate={bitrate}
    >
      <JS2VideoLayout>
        <JS2VideoPreview />
        <JS2VideoControls />
      </JS2VideoLayout>
    </JS2VideoProvider>
  );
};

export { JS2Video };
