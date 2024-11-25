import { JS2VideoProvider } from "./js2video-provider";
import { JS2VideoPreview } from "./js2video-preview";
import { JS2VideoControls } from "./js2video-controls";
import { JS2VideoEditor } from "./js2video-editor";
import { JS2VideoLayout } from "./js2video-layout";

/**
 *
 * JS2Video Component
 *
 * @param {Object} props - Component props
 * @param {string} props.templateUrl - URL to the video template.
 * @param {Object} [props.params] - Video template params. Default; {}.
 * @param {string} [props.videoFilePrefix] - String to prefix exported video file names with. default: js2video.
 * @param {boolean} [props.autoPlay] - Play video immediately after loading? Default: false.
 * @param {boolean} [props.loop] - Loop the video? Default: false.
 * @param {boolean} [props.enableUnsecureMode] - Enables the template to be loaded and executed from outside an iframe. Use with caution, and only set to 'true' if you trust the template code as it enables code execution on the current page. Default: false.
 * @param {boolean} [props.showEditor] - Show the video template code editor. Default: true.
 * @returns {JSX.Element} - The video template preview wrapped a context
 */
const JS2Video = ({
  templateUrl,
  params = {},
  videoFilePrefix = "js2video",
  autoPlay = false,
  loop = false,
  enableUnsecureMode = false,
  showEditor = true,
}) => {
  return (
    <JS2VideoProvider
      templateUrl={templateUrl}
      params={params}
      videoFilePrefix={videoFilePrefix}
      autoPlay={autoPlay}
      loop={loop}
      enableUnsecureMode={enableUnsecureMode}
    >
      <JS2VideoLayout>
        {showEditor && <JS2VideoEditor />}
        <JS2VideoPreview />
        <JS2VideoControls />
      </JS2VideoLayout>
    </JS2VideoProvider>
  );
};

export { JS2Video };
