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
 * @property {OnBeforeExportFunction | null} onBeforeExport - A function that's called before the video is exported. Must return true for export to continue.
 */

/**
 * The Context object that holds shared data and state for video templates.
 *
 * @type {React.Context<ContextType>}
 */
const Context = createContext({
  videoTemplate: null,
  previewRef: null,
  templateError: null,
  setTemplateUrl: null,
  setParams: null,
  onBeforeExport: null,
  isLoading: true,
});

/**
 * Custom hook for accessing the JS2Video context.
 * @returns {ContextType} The context value
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
 * @param {OnBeforeExportFunction | undefined} [props.onBeforeExport] - A function that's called before the video is exported. Must return true for export to continue.
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
  onBeforeExport,
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

  const lastStateRef = useRef({ currentTime: 0, range: null });

  useEffect(() => {
    // enqueue load job
    queueRef.current.enqueue(async () => {
      console.log("loading video template in provider...");

      setIsLoading(true);
      setTemplateError(null);

      // grab carry-over values
      const { currentTime, range } = lastStateRef.current;
      let updatedParams = { ...params };
      if (range) {
        updatedParams.range = range;
      }

      const vt = new VideoTemplate({
        templateUrl,
        enableUnsecureMode,
        parentElement: previewRef.current,
        autoPlay,
        loop,
        params: updatedParams,
        videoFilePrefix,
      });

      try {
        await vt.load();

        // seek to previous time if any
        if (currentTime) {
          await vt.seek({ time: currentTime });
        }

        vtRef.current = vt;
        setVideoTemplate(vt);
        console.log("loaded video template in provider");
      } catch (err) {
        console.error(err);
        setTemplateError(err);
        try {
          await vt.dispose();
        } catch (disposeErr) {
          console.warn("dispose on error", disposeErr);
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      // enqueue dispose job
      queueRef.current.enqueue(async () => {
        if (vtRef.current) {
          // save state for next run
          lastStateRef.current = {
            currentTime: vtRef.current.currentTime,
            range: vtRef.current.range,
          };

          try {
            console.log("disposing video template in provider...");
            await vtRef.current.dispose();
            console.log("disposed video template in provider");
          } catch (err) {
            console.warn("dispose on cleanup", err);
          }
          vtRef.current = null;
        }
      });
    };
  }, [templateUrl, params]);

  useEffect(() => {
    if (onLoading) {
      onLoading({ isLoading, videoTemplate: vtRef.current });
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
        onBeforeExport,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { useJS2Video, JS2VideoProvider };
