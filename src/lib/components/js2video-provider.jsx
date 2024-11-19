import React from "react";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { VideoTemplate } from "../video-template";

/**
 * @typedef {object} ContextType
 * @property {VideoTemplate | null} videoTemplate - An instance of the VideoTemplate class.
 * @property {React.MutableRefObject<HTMLDivElement | null> | null} previewRef - A reference to the HTML div element where preview should be displayed, or null if not set.
 * @property {Error | null} templateError - An error message related to the template, or null if no error exists.
 * @property {React.Dispatch<React.SetStateAction<string>> | null} setTemplateUrl - The setter function for updating the template URL state variable.
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
 * @param {boolean} [props.autoPlay] - Play video immediately after loading? Default: false.
 * @param {boolean} [props.loop] - Loop the video? Default: false.
 * @param {boolean} [props.enableUnsecureMode] - Enables the template to be loaded and executed from outside an iframe. Use with caution, and only set to 'true' if you trust the template code as it enables code execution on the current page. Default: false.
 * @returns {JSX.Element} - The video template preview wrapped a context
 */
const JS2VideoProvider = ({
  templateUrl: defaultTemplateUrl,
  params = {},
  autoPlay = false,
  loop = false,
  enableUnsecureMode = false,
  children,
}) => {
  const [templateUrl, setTemplateUrl] = useState(defaultTemplateUrl);
  const [videoTemplate, setVideoTemplate] = useState(null);
  const [templateError, setTemplateError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const vtRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    setTemplateUrl(defaultTemplateUrl);
  }, [defaultTemplateUrl]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setTemplateError(null);
      try {
        vtRef.current?.dispose();
      } catch (err) {
        console.error(err);
      }
      vtRef.current = new VideoTemplate({
        templateUrl,
        enableUnsecureMode,
        parentElement: previewRef.current,
        autoPlay,
        loop,
        params,
      });
      try {
        await vtRef.current.load();
        setVideoTemplate(vtRef.current);
      } catch (err) {
        await vtRef.current.dispose();
        setTemplateError(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [templateUrl, params]);

  return (
    <Context.Provider
      value={{
        videoTemplate,
        previewRef,
        templateError,
        setTemplateUrl,
        isLoading,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { useJS2Video, JS2VideoProvider };
