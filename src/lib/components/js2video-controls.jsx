import React from "react";
import { useJS2VideoEvent } from "./hooks/use-js2video-event";
import { useJS2Video } from "./js2video-provider";

const PlayButton = (props) => {
  return (
    <button
      {...props}
      style={{
        position: "relative",
        width: "60px",
        height: "60px",
        backgroundColor: "black",
        border: "none",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        boxShadow:
          "0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3)",
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "24px solid white",
          borderTop: "15px solid transparent",
          borderBottom: "15px solid transparent",
          marginLeft: "6px",
        }}
      />
    </button>
  );
};

const Scrubber = () => {
  const { message } = useJS2VideoEvent();
  const progress = message?.timeline ? message.timeline.progress() : 0;
  return (
    <div style={{ backgroundColor: "black" }}>
      <div
        style={{
          backgroundColor: "white",
          height: "2px",
          width: progress * 100 + "%",
        }}
      ></div>
    </div>
  );
};

const TogglePlayButton = () => {
  const { videoTemplate } = useJS2Video();
  const { message } = useJS2VideoEvent();
  if (message?.timeline.isActive()) {
    return;
  } else {
    return (
      <PlayButton
        onClick={(e) => {
          e.stopPropagation();
          videoTemplate.togglePlay();
        }}
      />
    );
  }
};

/**
 * Simple playback controls
 * @returns {JSX.Element}
 */
const JS2VideoControls = () => {
  const { videoTemplate } = useJS2Video();
  return (
    <div
      style={{ flex: "1 1 0%", display: "flex", flexDirection: "column" }}
      onClick={(e) => videoTemplate?.togglePlay()}
    >
      <div
        style={{
          flex: "1 1 0%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TogglePlayButton />
      </div>
      <Scrubber />
    </div>
  );
};

export { JS2VideoControls };
