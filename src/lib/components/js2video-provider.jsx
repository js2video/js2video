import React from "react";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { VideoTemplate } from "../video-template";

const Context = createContext({
  videoTemplate: null,
  previewRef: null,
});

/**
 * Custom hook for accessing the JS2Video context.
 * @returns {{ videoTemplate: VideoTemplate | null, previewRef: React.MutableRefObject<HTMLDivElement | null> | null }} - The video template and preview element ref.
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
const JS2VideoProvider = ({
  templateUrl,
  params = {},
  size = { width: 1920, height: 1080 },
  fps = 30,
  bitrate = 5_000_000,
  autoPlay = false,
  loop = false,
  enableUnsecureMode = false,
  children,
}) => {
  const [videoTemplate, setVideoTemplate] = useState(null);

  const vtRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    vtRef.current = videoTemplate;
  }, [videoTemplate]);

  useEffect(() => {
    async function load() {
      const vt = new VideoTemplate();
      await vt.load({
        templateUrl,
        enableUnsecureMode,
        parentElement: previewRef.current,
        autoPlay,
        loop,
        params,
        size,
        fps,
        bitrate,
      });
      setVideoTemplate(vt);
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
  }, [templateUrl, params, size, fps, bitrate]);

  return (
    <Context.Provider value={{ videoTemplate, previewRef }}>
      {children}
    </Context.Provider>
  );
};

export { useJS2Video, JS2VideoProvider };
