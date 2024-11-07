import React from "react";
import { useJS2VideoEvent } from "./hooks/use-js2video-event";
import { useJS2Video } from "./js2video-provider";
import { formatTime } from "../utils";

const CurrentTime = () => {
  const { message } = useJS2VideoEvent();
  const currentTime = message?.timeline ? message.timeline.time() : 0;
  const duration = message?.timeline ? message.timeline.duration() : 0;
  return (
    <div
      style={{
        color: "rgba(255, 255, 255, 0.6)",
        paddingLeft: "4px",
        fontSize: "12px",
        fontFamily: "monospace",
      }}
    >
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  );
};

const Scrubber = () => {
  const { message } = useJS2VideoEvent();
  const progress = message?.timeline ? message.timeline.progress() : 0;
  return (
    <div
      style={{
        backgroundColor: "rgba(123, 123, 123, 0.5)",
        flex: "1 1 0%",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          height: "2px",
          width: progress * 100 + "%",
        }}
      ></div>
    </div>
  );
};

const SmallTogglePlayButton = () => {
  const { videoTemplate } = useJS2Video();
  const { message } = useJS2VideoEvent();
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (videoTemplate) {
          videoTemplate.togglePlay();
        }
      }}
      style={{
        all: "unset",
        cursor: "pointer",
        padding: "2px 8px 2px 8px",
        backgroundColor: "black",
        color: "white",
        border: "1px #555 solid",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "3px",
      }}
    >
      {message?.timeline.isActive() ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="14" y="4" width="4" height="16" rx="1" />
          <rect x="6" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
      )}
    </button>
  );
};

const SmallRewindButton = () => {
  const { videoTemplate } = useJS2Video();
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        if (videoTemplate) {
          await videoTemplate.rewind();
        }
      }}
      style={{
        all: "unset",
        cursor: "pointer",
        padding: "2px 8px 2px 6px",
        backgroundColor: "black",
        color: "white",
        border: "1px #555 solid",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "3px",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="11 19 2 12 11 5 11 19" />
        <polygon points="22 19 13 12 22 5 22 19" />
      </svg>
    </button>
  );
};

const TogglePlayButton = () => {
  const { videoTemplate } = useJS2Video();
  const { message } = useJS2VideoEvent();
  if (message?.timeline.isActive()) {
    return;
  } else {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (videoTemplate) {
            videoTemplate.togglePlay();
          }
        }}
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
      <div
        style={{
          display: "flex",
          gap: "6px",
          padding: "4px",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
      >
        <SmallRewindButton />
        <SmallTogglePlayButton />
        <Scrubber />
        <CurrentTime />
      </div>
    </div>
  );
};

export { JS2VideoControls };
