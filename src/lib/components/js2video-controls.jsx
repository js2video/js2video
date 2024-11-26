import { useJS2VideoEventProperty } from "./hooks/use-js2video-event-property";
import { useJS2Video } from "./js2video-provider";
import { canBrowserEncodeVideo, formatTime } from "../utils";
import {
  PlayIcon,
  PauseIcon,
  RewindIcon,
  ArrowDownToLineIcon,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import * as Slider from "@radix-ui/react-slider";
import confetti from "canvas-confetti";

const useDuration = () => useJS2VideoEventProperty("duration", 0);
const useCurrentTime = () => useJS2VideoEventProperty("currentTime", 0);
const useProgress = () => useJS2VideoEventProperty("progress", 0);
const useIsExporting = () => useJS2VideoEventProperty("isExporting", 0);
const useIsPlaying = () => useJS2VideoEventProperty("isPlaying", false);

const CurrentTime = () => {
  const currentTime = useCurrentTime();
  const duration = useDuration();
  return (
    <div className="tabular-nums px-2 text-white text-sm opacity-60">
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  );
};

const Scrubber = () => {
  const resolution = 1000;
  const progress = useProgress();
  const { videoTemplate } = useJS2Video();
  const handleChange = (value) => videoTemplate.scrub(value[0] / resolution);
  const handleCommit = async (value) => {
    const progress = value[0] / resolution;
    const time = videoTemplate.duration * progress;
    await videoTemplate.seek(time);
  };
  return (
    <div className="flex-1 px-4" onClick={(e) => e.stopPropagation()}>
      {/* https://www.radix-ui.com/primitives/docs/components/slider#api-reference */}
      <Slider.Root
        className="relative flex h-5 flex-1 touch-none select-none items-center"
        value={[progress * resolution]}
        max={resolution}
        step={1}
        onValueChange={handleChange}
        onValueCommit={handleCommit}
      >
        <Slider.Track className="relative h-[2px] grow rounded-full bg-[#333333]">
          <Slider.Range className="absolute h-full rounded-full bg-white" />
        </Slider.Track>
        <Slider.Thumb
          className="block size-5 rounded-[10px] bg-white focus:outline-none"
          aria-label="Position"
        />
      </Slider.Root>
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
  const progress = useProgress();
  const isExporting = useIsExporting();
  return (
    <>
      {!!isExporting && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="text-white">
            Exporting MP4 to disk... {Math.round(progress * 100)}%
          </div>
        </div>
      )}
      <ControlButton
        onClick={async (e) => {
          e.stopPropagation();
          if (!canBrowserEncodeVideo()) {
            return alert(
              "Exporting videos from the browser is only supported in newer versions of Chrome on the desktop."
            );
          }
          try {
            await videoTemplate.export({
              isPuppeteer: false,
            });
            confetti();
          } catch (err) {
            console.error(err);
          }
        }}
      >
        <ArrowDownToLineIcon size={26} />
      </ControlButton>
    </>
  );
};

const TogglePlayButton = () => {
  const { videoTemplate } = useJS2Video();
  const isPlaying = useIsPlaying();
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
  const isPlaying = useIsPlaying();
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

/**
 * Simple playback controls
 * @returns {JSX.Element}
 */
const JS2VideoControls = () => {
  const { videoTemplate } = useJS2Video();
  const [isMouseActive, setIsMouseActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [timer, setTimer] = useState(null);
  const elementRef = useRef(null);
  const isPlaying = useIsPlaying();

  const handleMouseMove = () => {
    if (timer) {
      clearTimeout(timer);
    }
    setIsMouseActive(true);
    setTimer(setTimeout(() => setIsMouseActive(false), 2000));
  };

  useEffect(() => {
    if (videoTemplate) {
      videoTemplate.triggerEvent();
    }
  }, [videoTemplate]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isPlaying, timer]);

  if (!videoTemplate) {
    return;
  }

  const isVisible = isHovered || !isPlaying || isMouseActive;

  return (
    <div
      ref={elementRef}
      className="absolute inset-0 flex flex-col"
      onClick={(e) => videoTemplate.togglePlay()}
      style={{ transition: "opacity 0.5s ease", opacity: isVisible ? 1 : 0 }}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <PlayButton />
      </div>
      <div
        onMouseEnter={(e) => setIsHovered(true)}
        onMouseLeave={(e) => setIsHovered(false)}
        className="flex items-center bg-black bg-opacity-50 px-2"
      >
        <RewindButton />
        <TogglePlayButton />
        <Scrubber />
        <CurrentTime />
        <ExportButton />
      </div>
    </div>
  );
};

export { JS2VideoControls };
