import React from "react";
import { useJS2Video } from "./js2video-provider";

/**
 * A preview component that renders a preview of the video.
 *
 * @returns {JSX.Element}
 */
const JS2VideoPreview = () => {
  const { previewRef } = useJS2Video();
  return <div ref={previewRef}></div>;
};

export { JS2VideoPreview };
