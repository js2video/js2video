import React from "react";
import { useJS2Video } from "./js2video-provider";

/**
 * A preview component that renders a preview of the video.
 *
 * @returns {JSX.Element}
 */
const JS2VideoPreview = () => {
  const { previewRef, templateError } = useJS2Video();
  if (templateError) {
    return (
      <div className="bg-red-500 text-white p-4">
        {`Template Error: ${templateError}`}
      </div>
    );
  }
  return <div ref={previewRef}></div>;
};

export { JS2VideoPreview };
