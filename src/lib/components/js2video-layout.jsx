import React from "react";
import { JS2VideoPreview } from "./js2video-preview";
import { JS2VideoControls } from "./js2video-controls";
import { JS2VideoEditor } from "./js2video-editor";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useJS2Video } from "./js2video-provider";

/**
 * A React helper component that wraps the other JS2Video React components in a pre-defined layout.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */

const JS2VideoLayout = ({ children }) => {
  let preview = null;
  let controls = null;
  let editor = null;

  const { videoTemplate } = useJS2Video();

  // component slots
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === JS2VideoPreview) {
        preview = child;
      } else if (child.type === JS2VideoControls) {
        controls = child;
      } else if (child.type === JS2VideoEditor) {
        editor = child;
      }
    }
  });

  if (!editor) {
    return (
      <div className="flex-1 bg-black relative">
        {preview && preview}
        {controls && controls}
      </div>
    );
  }

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={30} className="flex border-r border-gray-500">
        {editor}
      </Panel>
      <PanelResizeHandle />
      <Panel
        className="relative bg-black"
        onResize={(e) => videoTemplate?.scaleToFit()}
      >
        {preview && preview}
        {controls && controls}
      </Panel>
    </PanelGroup>
  );
};

export { JS2VideoLayout };
