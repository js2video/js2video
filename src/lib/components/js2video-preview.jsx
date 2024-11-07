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
    console.log(templateError);
    return (
      <div
        style={{
          backgroundColor: "#aa0000",
          padding: "10px",
          color: "#ffffff",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        {`Template Error: ${templateError}`}
      </div>
    );
  }
  return <div ref={previewRef}></div>;
};

export { JS2VideoPreview };
