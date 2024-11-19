import React from "react";
import { useJS2VideoEvent } from "./hooks/use-js2video-event";
import { useJS2Video } from "./js2video-provider";
import { canBrowserEncodeVideo, formatTime } from "../utils";
import {
  PlayIcon,
  PauseIcon,
  RewindIcon,
  ArrowDownToLineIcon,
} from "lucide-react";
import { useState, useEffect } from "react";

const CurrentTime = () => {
  const { currentTime, duration } = useJS2VideoEvent();
  return (
    <div className="tabular-nums px-2 text-white text-sm opacity-60">
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  );
};

const Scrubber = () => {
  const { progress } = useJS2VideoEvent();
  return (
    <div className="flex-1 bg-white bg-opacity-30 mx-2">
      <div
        className="bg-white bg-opacity-90 h-[1px]"
        style={{
          width: progress * 100 + "%",
        }}
      ></div>
    </div>
  );
};

const ControlButton = ({ children, ...rest }) => {
  return (
    <button {...rest} className="text-white p-2">
      {children}
    </button>
  );
};

const ExportButton = () => {
  const { videoTemplate } = useJS2Video();
  return (
    <ControlButton
      onClick={async (e) => {
        e.stopPropagation();
        if (!canBrowserEncodeVideo()) {
          return alert(
            "Exporting videos from the browser is only supported in newer versions of Chrome on the desktop."
          );
        }
        await videoTemplate.export({ isPuppeteer: false });
      }}
    >
      <ArrowDownToLineIcon size={22} />
    </ControlButton>
  );
};

const TogglePlayButton = () => {
  const { videoTemplate } = useJS2Video();
  const { isPlaying } = useJS2VideoEvent();
  return (
    <ControlButton
      onClick={(e) => {
        e.stopPropagation();
        videoTemplate.togglePlay();
      }}
    >
      {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
    </ControlButton>
  );
};

const RewindButton = () => {
  const { videoTemplate } = useJS2Video();
  return (
    <ControlButton
      onClick={async (e) => {
        e.stopPropagation();
        await videoTemplate.rewind();
      }}
    >
      <RewindIcon size={22} />
    </ControlButton>
  );
};

const PlayButton = () => {
  const { videoTemplate } = useJS2Video();
  const { isPlaying } = useJS2VideoEvent();
  if (isPlaying) {
    return;
  } else {
    return (
      <button
        className="bg-black size-[66px] rounded-full flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation();
          videoTemplate.togglePlay();
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

const ExportStatus = () => {
  const [isExporting, setIsExporting] = useState(false);
  useEffect(() => {
    const listener = (e) => {
      setIsExporting(e.detail.isExporting);
    };
    window.addEventListener("js2video", listener);
    return () => {
      window.removeEventListener("js2video", listener);
    };
  }, []);
  if (!isExporting) {
    return;
  }
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="text-white">Exporting MP4 to disk...</div>
    </div>
  );
};

/**
 * Simple playback controls
 * @returns {JSX.Element}
 */
const JS2VideoControls = () => {
  const { videoTemplate } = useJS2Video();
  if (!videoTemplate) {
    return;
  }
  return (
    <>
      <div
        className="absolute inset-0 flex flex-col"
        onClick={(e) => videoTemplate.togglePlay()}
      >
        <div className="flex flex-1 flex-col items-center justify-center">
          <PlayButton />
        </div>
        <div className="flex items-center bg-black bg-opacity-50 px-2">
          <RewindButton />
          <TogglePlayButton />
          <Scrubber />
          <CurrentTime />
          <ExportButton />
        </div>
      </div>
      <ExportStatus />
    </>
  );
};

export { JS2VideoControls };
