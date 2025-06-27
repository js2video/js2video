import { JS2VideoPreview } from "./js2video-preview";
import { JS2VideoControls } from "./js2video-controls";
import { Children, isValidElement } from "react";

/**
 * A React component that wraps the other JS2Video React components in a pre-defined layout.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */

const JS2VideoLayout = ({ children }) => {
  let preview = null;
  let controls = null;

  // component slots
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === JS2VideoPreview) {
        preview = child;
      } else if (child.type === JS2VideoControls) {
        controls = child;
      }
    }
  });

  return (
    <div className="flex-1 flex flex-col">
      {preview && preview}
      {controls && controls}
    </div>
  );

  // return (
  //   <PanelGroup direction="horizontal">
  //     <Panel defaultSize={30} className="flex border-r border-gray-500">
  //       {editor}
  //     </Panel>
  //     <PanelResizeHandle />
  //     <Panel
  //       className="flex flex-col"
  //       onResize={(e) => videoTemplate?.scaleToFit()}
  //     >
  //       {preview && preview}
  //       {controls && controls}
  //     </Panel>
  //   </PanelGroup>
  // );
};

export { JS2VideoLayout };
