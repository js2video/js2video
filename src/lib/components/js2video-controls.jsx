import { useJS2VideoEventProperty } from "./hooks/use-js2video-event-property";
import { useJS2Video } from "./js2video-provider";
import { canBrowserEncodeVideo, formatTime, cn, invlerp } from "../utils";
import {
  PlayIcon,
  PauseIcon,
  RewindIcon,
  ArrowDownToLineIcon,
  SquareArrowDownIcon,
  Loader2Icon,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import * as Slider from "@radix-ui/react-slider";
import confetti from "canvas-confetti";

const useDuration = () => useJS2VideoEventProperty("duration", 0);
const useCurrentTime = () => useJS2VideoEventProperty("currentTime", 0);
const useProgress = () => useJS2VideoEventProperty("progress", 0);
const useIsExporting = () => useJS2VideoEventProperty("isExporting", 0);
const useIsPlaying = () => useJS2VideoEventProperty("isPlaying", false);
const useRangeStart = () => useJS2VideoEventProperty("rangeStart", 0);
const useRangeEnd = () => useJS2VideoEventProperty("rangeEnd", 1);

const CurrentTime = () => {
  const currentTime = useCurrentTime();
  const duration = useDuration();
  return (
    <div className="tabular-nums px-2 text-white text-sm opacity-70 font-mono">
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  );
};

const Scrubber = () => {
  const { isLoading, videoTemplate } = useJS2Video();
  const progress = useProgress();
  const rangeStart = useRangeStart();
  const rangeEnd = useRangeEnd();

  const handleChange = (value) => {
    if (isLoading) {
      return;
    }
    videoTemplate?.setRange(value[0], value[2]);
    videoTemplate?.scrub(value[1]);
  };

  const handleCommit = async (value) => {
    if (isLoading) {
      return;
    }
    await videoTemplate?.seek({ progress: value[1] });
  };

  // display placeholder until its loaded
  if (!videoTemplate) {
    return (
      <div className="flex-1 h-[2px] rounded-full bg-[#111111] mx-4"></div>
    );
  }

  return (
    <div className="flex-1 px-4" onClick={(e) => e.stopPropagation()}>
      {/* https://www.radix-ui.com/primitives/docs/components/slider#api-reference */}
      <Slider.Root
        className="relative flex h-5 flex-1 touch-none select-none items-center"
        value={[rangeStart, progress, rangeEnd]}
        max={1}
        step={0.001}
        onValueChange={handleChange}
        onValueCommit={handleCommit}
      >
        <Slider.Track className="relative h-[2px] grow rounded-full bg-[#333333]">
          <Slider.Range
            className="absolute h-full rounded-full bg-white"
            asChild
          >
            <div
              style={{
                height: "2px",
                background: `linear-gradient(to right, #fafafa 100%, #555555 100% 100%)`,
              }}
            ></div>
          </Slider.Range>
        </Slider.Track>
        <Slider.Thumb
          className="block size-3 rounded-full bg-white focus:outline-none"
          aria-label="Position"
        />
        <Slider.Thumb
          className="block size-5 rounded-full bg-white focus:outline-none"
          aria-label="Position"
        />
        <Slider.Thumb
          className="block size-3 rounded-full bg-white focus:outline-none"
          aria-label="Position"
        />
      </Slider.Root>
    </div>
  );
};

const ControlButton = ({ children, ...rest }) => {
  const { isLoading } = useJS2Video();
  return (
    <button
      {...rest}
      disabled={isLoading}
      className={cn("text-white p-2", { "text-white/60": isLoading })}
    >
      {children}
    </button>
  );
};

const ExportServerButton = () => {
  const { videoTemplate } = useJS2Video();
  const rangeStart = useRangeStart();
  const rangeEnd = useRangeEnd();

  // @ts-ignore
  const apiUrl = import.meta.env.VITE_EXPORT_API_URL;
  if (!apiUrl) {
    return;
  }
  const handleClick = async (e) => {
    e.stopPropagation();
    await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        templateUrl: videoTemplate.templateUrl,
        params: {
          range: [rangeStart, rangeEnd],
        },
      }),
    });
  };
  return (
    <ControlButton onClick={handleClick}>
      <SquareArrowDownIcon size={26} />
    </ControlButton>
  );
};

const ExportButton = () => {
  const { videoTemplate } = useJS2Video();
  const progress = useProgress();
  const isExporting = useIsExporting();
  const [abortController, setAbortController] = useState(null);
  const [isAborted, setIsAborted] = useState(false);

  // cleanup
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  const handleAbort = () => {
    if (isAborted) {
      return;
    }
    if (abortController) {
      setIsAborted(true);
      abortController.abort();
      setAbortController(null);
    }
  };

  const handleClick = async (e) => {
    console.log(videoTemplate.templateUrl);
    e.stopPropagation();
    if (!canBrowserEncodeVideo()) {
      return alert(
        "Exporting videos from the browser is only supported in newer versions of Chrome on the desktop."
      );
    }
    const controller = new AbortController(); // Create a new controller
    setAbortController(controller);
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `${videoTemplate.videoFilePrefix}-${Date.now()}.mp4`,
        types: [
          {
            description: "Video File",
            accept: { "video/mp4": [".mp4"] },
          },
        ],
      });
      const fileStream = await fileHandle.createWritable();
      await videoTemplate.export({
        signal: controller.signal,
        fileStream,
      });
      setIsAborted(false);
      confetti();
    } catch (err) {
      console.error(err);
      setIsAborted(false);
    }
  };

  return (
    <>
      {!!isExporting && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="flex items-center flex-col gap-4">
            <div className="text-white">
              Exporting MP4 to disk... {Math.round(progress * 100)}%
            </div>
            <button
              onClick={handleAbort}
              className="bg-black px-4 py-2 rounded text-white text-sm"
            >
              Abort
            </button>
          </div>
        </div>
      )}

      <ControlButton onClick={handleClick}>
        <ArrowDownToLineIcon size={26} />
      </ControlButton>
    </>
  );
};

const TogglePlayButton = () => {
  const { isLoading, videoTemplate } = useJS2Video();
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
  const { isLoading, videoTemplate } = useJS2Video();
  const isPlaying = useIsPlaying();

  if (isPlaying) {
    return;
  }

  if (isLoading) {
    return (
      <div className="text-white">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

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
};

/**
 * Simple playback controls
 * @returns {JSX.Element}
 */
const JS2VideoControls = () => {
  const { isLoading, videoTemplate } = useJS2Video();
  const [isMouseActive, setIsMouseActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);
  const elementRef = useRef(null);
  const isPlaying = useIsPlaying();

  const handleMouseMove = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsMouseActive(true);
    timerRef.current = setTimeout(() => {
      setIsMouseActive(false);
    }, 2000);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying]);

  const isVisible = isHovered || !isPlaying || isMouseActive;

  return (
    <div
      ref={elementRef}
      className="absolute inset-0 flex flex-col"
      onClick={(e) => (isLoading ? null : videoTemplate.togglePlay())}
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
        <ExportServerButton />
      </div>
    </div>
  );
};

export { JS2VideoControls };
