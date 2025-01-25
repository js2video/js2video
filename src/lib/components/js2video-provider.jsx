import { createContext, useContext, useEffect, useState, useRef } from "react";
import { VideoTemplate } from "../video-template";

class AsyncQueue {
  constructor() {
    this.queue = Promise.resolve();
  }
  enqueue(fn) {
    this.queue = this.queue.then(fn);
    return this.queue;
  }
}

/**
 * @typedef {object} ContextType
 * @property {VideoTemplate | null} videoTemplate - An instance of the VideoTemplate class.
 * @property {React.MutableRefObject<HTMLDivElement | null> | null} previewRef - A reference to the HTML div element where preview should be displayed, or null if not set.
 * @property {Error | null} templateError - An error message related to the template, or null if no error exists.
 * @property {React.Dispatch<React.SetStateAction<string>> | null} setTemplateUrl - The setter function for updating the template URL state variable.
 * @property {React.Dispatch<React.SetStateAction<Object>> | null} setParams - The setter function for updating the template params state variable.
 * @property {boolean} isLoading - A flag to indicate whether the video template is loading.
 */

/**
 * The Context object that holds shared data and state for video templates.
 *
 * @type {React.Context<ContextType>}
 */
const Context = createContext({
  /** @type {VideoTemplate | null} */
  videoTemplate: null,
  /** @type {React.MutableRefObject<HTMLDivElement | null> | null} */
  previewRef: null,
  /** @type {Error | null} */
  templateError: null,
  /** @type {React.Dispatch<React.SetStateAction<string>>} */
  setTemplateUrl: () => {},
  /** @type {React.Dispatch<React.SetStateAction<Object>>} */
  setParams: () => {},
  /** @type {boolean} */
  isLoading: true,
});

/**
 * Custom hook for accessing the JS2Video context.
 * @returns {{
 * videoTemplate: VideoTemplate | null,
 * templateError: Error | null,
 * previewRef: React.MutableRefObject<HTMLDivElement | null> | null
 * setTemplateUrl: React.Dispatch<React.SetStateAction<string>>,
 * isLoading: boolean
 * }}
 * @throws {Error} If used outside of a JS2VideoProvider.
 */
const useJS2Video = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error(
      "useJS2Video must be used in a component within the JS2VideoProvider"
    );
  }
  return context;
};

/**
 *
 * JS2Video Provider Component
 * @param {Object} props - Component props
 * @param {string} props.templateUrl - URL to the video template.
 * @param {React.ReactNode} props.children
 * @param {Object} [props.params] - Video template params. Default; {}.
 * @param {string} [props.videoFilePrefix] - String to prefix exported video file names with. default: js2video.
 * @param {boolean} [props.autoPlay] - Play video immediately after loading? Default: false.
 * @param {boolean} [props.loop] - Loop the video? Default: false.
 * @param {boolean} [props.enableUnsecureMode] - Enables the template to be loaded and executed from outside an iframe. Use with caution, and only set to 'true' if you trust the template code as it enables code execution on the current page. Default: false.
 * @param {OnLoadingFunction | undefined} [props.onLoading] - OnLoading callback function.
 * @returns {JSX.Element} - The video template preview wrapped a context
 */
const JS2VideoProvider = ({
  templateUrl: defaultTemplateUrl,
  params: defaultParams = {},
  videoFilePrefix = "js2video",
  autoPlay = false,
  loop = false,
  enableUnsecureMode = false,
  onLoading,
  children,
}) => {
  const [templateUrl, setTemplateUrl] = useState(defaultTemplateUrl);
  const [params, setParams] = useState(defaultParams);
  const [videoTemplate, setVideoTemplate] = useState(null);
  const [templateError, setTemplateError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const vtRef = useRef(null);
  const previewRef = useRef(null);
  const queueRef = useRef(new AsyncQueue());

  useEffect(() => {
    setTemplateUrl(defaultTemplateUrl);
  }, [defaultTemplateUrl]);

  useEffect(() => {
    setParams(defaultParams);
  }, [defaultParams]);

  useEffect(() => {
    vtRef.current = videoTemplate;
  }, [videoTemplate]);

  useEffect(() => {
    async function load() {
      await queueRef.current.enqueue(async () => {
        setIsLoading(true);
        setTemplateError(null);
        // dispose previous loaded template instance
        if (vtRef.current) {
          try {
            await vtRef.current.dispose();
          } catch (err) {
            console.log("error disposing template", err);
          }
          vtRef.current = null;
        }
        // load new template instance
        const vt = new VideoTemplate({
          templateUrl,
          enableUnsecureMode,
          parentElement: previewRef.current,
          autoPlay,
          loop,
          params,
          videoFilePrefix,
        });
        try {
          await vt.load();
          vtRef.current = vt;
          setVideoTemplate(vt);
        } catch (err) {
          setTemplateError(err);
          try {
            await vt.dispose();
          } catch (err) {
            console.warn("dispose on error problem:", err);
          }
        } finally {
          setIsLoading(false);
        }
      });
    }
    load();
  }, [templateUrl, params]);

  useEffect(() => {
    if (onLoading) {
      onLoading(isLoading);
    }
  }, [isLoading]);

  return (
    <Context.Provider
      value={{
        videoTemplate,
        previewRef,
        templateError,
        setTemplateUrl,
        setParams,
        isLoading,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { useJS2Video, JS2VideoProvider };
