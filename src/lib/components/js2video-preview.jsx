import React from "react";
import { useJS2Video } from "./js2video-provider";

/**
 * A preview component that renders a preview of the video.
 *
 * @param {Object} props - The props object.
 * @returns {JSX.Element} The preview component.
 */
const JS2VideoPreview = () => {
  const { previewRef } = useJS2Video();
  return <div ref={previewRef}></div>;
};

export { JS2VideoPreview };
