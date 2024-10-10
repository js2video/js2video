import React from "react";
import { JS2VideoPreview } from "./js2video-preview";
import { JS2VideoControls } from "./js2video-controls";

const JS2VideoLayout = ({ children }) => {
  let preview = null;
  let controls = null;

  // slots
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === JS2VideoPreview) {
        preview = child;
      } else if (child.type === JS2VideoControls) {
        controls = child;
      }
    }
  });

  return (
    <div
      style={{
        flex: "1 1 0%",
        backgroundColor: "black",
        position: "relative",
      }}
    >
      <div>{!!preview && preview}</div>
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        {!!controls && controls}
      </div>
    </div>
  );
};

export { JS2VideoLayout };
