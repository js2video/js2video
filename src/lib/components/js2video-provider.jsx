import React from "react";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { VideoTemplate } from "../video-template";

const Context = createContext({
  videoTemplate: null,
  previewRef: null,
  templateError: null,
});

/**
 * Custom hook for accessing the JS2Video context.
 * @returns {{ videoTemplate: VideoTemplate | null, templateError: Error | null, previewRef: React.MutableRefObject<HTMLDivElement | null> | null }} - The video template and preview element ref.
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
  templateUrl,
  params = {},
  autoPlay = false,
  loop = false,
  enableUnsecureMode = false,
  children,
}) => {
  const [videoTemplate, setVideoTemplate] = useState(null);
  const [templateError, setTemplateError] = useState(null);

  const vtRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    vtRef.current = videoTemplate;
  }, [videoTemplate]);

  useEffect(() => {
    async function load() {
      setTemplateError(null);
      const vt = new VideoTemplate();
      try {
        await vt.load({
          templateUrl,
          enableUnsecureMode,
          parentElement: previewRef.current,
          autoPlay,
          loop,
          params,
        });
        setVideoTemplate(vt);
      } catch (err) {
        await vt.dispose();
        setTemplateError(err);
      }
    }

    load();

    return () => {
      async function dispose() {
        if (!vtRef.current) {
          return;
        }
        await vtRef.current.dispose();
      }
      dispose();
    };
  }, [templateUrl, params]);

  return (
    <Context.Provider value={{ videoTemplate, previewRef, templateError }}>
      {children}
    </Context.Provider>
  );
};

export { useJS2Video, JS2VideoProvider };
