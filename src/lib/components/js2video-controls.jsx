import React from "react";
import { useJS2VideoEvent } from "./hooks/use-js2video-event";
import { useJS2Video } from "./js2video-provider";
import { formatTime } from "../utils";
import { PlayIcon, PauseIcon, RewindIcon } from "lucide-react";

const ControlButton = ({ children, ...rest }) => {
  return (
    <button {...rest} className="text-white p-2">
      {children}
    </button>
  );
};

const CurrentTime = () => {
  const { message } = useJS2VideoEvent();
  const currentTime = message?.timeline ? message.timeline.time() : 0;
  const duration = message?.timeline ? message.timeline.duration() : 0;
  return (
    <div className="tabular-nums px-2 text-white text-xs opacity-60">
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  );
};

const Scrubber = () => {
  const { message } = useJS2VideoEvent();
  const progress = message?.timeline ? message.timeline.progress() : 0;
  return (
    <div className="flex-1 bg-white bg-opacity-10 mx-2">
      <div
        className="bg-white bg-opacity-80 h-[1px]"
        style={{
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
    <ControlButton
      onClick={(e) => {
        e.stopPropagation();
        if (videoTemplate) {
          videoTemplate.togglePlay();
        }
      }}
    >
      {message?.timeline.isActive() ? (
        <PauseIcon size={22} />
      ) : (
        <PlayIcon size={22} />
      )}
    </ControlButton>
  );
};

const SmallRewindButton = () => {
  const { videoTemplate } = useJS2Video();
  return (
    <ControlButton
      onClick={async (e) => {
        e.stopPropagation();
        if (videoTemplate) {
          await videoTemplate.rewind();
        }
      }}
    >
      <RewindIcon size={22} />
    </ControlButton>
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
        className="bg-black size-[66px] rounded-full flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation();
          if (videoTemplate) {
            videoTemplate.togglePlay();
          }
        }}
      >
        <div
          style={{
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
      className="flex flex-1 flex-col"
      onClick={(e) => videoTemplate?.togglePlay()}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <TogglePlayButton />
      </div>
      <div className="flex  items-center bg-black bg-opacity-50 px-2">
        <SmallRewindButton />
        <SmallTogglePlayButton />
        <Scrubber />
        <CurrentTime />
      </div>
    </div>
  );
};

export { JS2VideoControls };
