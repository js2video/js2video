import React from "react";
import { JS2VideoPreview } from "./js2video-preview";
import { JS2VideoControls } from "./js2video-controls";

/**
 * A component that wraps the JS2VideoPreview and JS2VideoControls components.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
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
    <div className="flex-1 bg-black relative">
      <div>{!!preview && preview}</div>
      <div className="absolute inset-0 flex">{!!controls && controls}</div>
    </div>
  );
};

export { JS2VideoLayout };
