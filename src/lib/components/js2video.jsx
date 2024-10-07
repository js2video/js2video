import React from "react";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { VideoTemplate } from "../video-template";
import { Preview } from "./preview";

/**
 * Generates a random string of specified length.
 * @param {number} length - The length of the random string.
 * @returns {string} - The generated random string.
 */
function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * The context for JS2Video to provide video template information.
 * @type {React.Context<{ videoTemplate: VideoTemplate | null }>}
 */
const Context = createContext();

/**
 * Custom hook to use the JS2Video context.
 * @returns {{ videoTemplate: VideoTemplate | null }} - The video template context.
 * @throws {Error} Throws an error if used outside of a Context.Provider.
 */
const useJS2Video = () => {
  const context = useContext(Context);
  // Check if context is undefined and throw an error if it is
  if (!context) {
    throw new Error("useJS2Video must be used within a Context.Provider");
  }
  return context;
};

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
 * @param {boolean} [props.yolo] - Enables the template to be loaded and executed from outside an iframe. Use with caution, and only set to 'true' if you trust the template code as it enables code execution on the current page. Default: false.
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
  yolo = false,
}) => {
  const [videoTemplate, setVideoTemplate] = useState(null);
  const [parentId, setParentId] = useState(
    `js2video-preview-${generateRandomString(10)}`
  );
  const vtRef = useRef(null);

  useEffect(() => {
    vtRef.current = videoTemplate;
  }, [videoTemplate]);

  useEffect(() => {
    async function load() {
      const vt = new VideoTemplate();
      await vt.load({
        templateUrl,
        yolo,
        parentId,
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
    <Context.Provider value={{ videoTemplate }}>
      <Preview parentId={parentId} />
    </Context.Provider>
  );
};

export { useJS2Video, JS2Video };
