import React from "react";
import { useJS2Video } from "./js2video";

/**
 * A preview component that renders a preview of the video.
 *
 * @param {Object} props - The props object.
 * @param {Object} [props.style] - CSS style object for the `div` element. Defaults to `{ flex: "1 1 0%", position: "relative" }`
 * @returns {JSX.Element} The preview component.
 */
const Preview = ({ style = { flex: "1 1 0%", position: "relative" } }) => {
  const { previewRef } = useJS2Video();
  return <div style={style} ref={previewRef}></div>;
};

export { Preview };
