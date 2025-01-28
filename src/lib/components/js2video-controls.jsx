import { useJS2VideoEventProperty } from "./hooks/use-js2video-event-property";
import { useJS2Video } from "./js2video-provider";
import { canBrowserEncodeVideo, formatTime, cn } from "../utils";
import {
  PlayIcon,
  PauseIcon,
  RewindIcon,
  ArrowDownToLineIcon,
  SquareArrowDownIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { Timeline } from "@xzdarcy/react-timeline-editor";

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
    <div className="px-2 text-sm opacity-70 font-mono whitespace-nowrap">
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  );
};

const CustomScale = ({ scale }) => {
  return <>{scale}</>;
};

const Scrubber = ({ scale, scaleWidth }) => {
  const { videoTemplate } = useJS2Video();
  const timelineRef = useRef();
  const [data, setData] = useState([]);
  const startLeft = 20;
  const scrollWhilePlaying = false;
  const autoScrollFrom = 500;

  useEffect(() => {
    const listener = (e) => {
      if (!timelineRef.current) {
        return;
      }
      const { type, videoTemplate } = e.detail;
      const { isPlaying, currentTime } = videoTemplate;
      // @ts-ignore
      timelineRef.current.setTime(currentTime);
      // auto scroll while playing
      if (scrollWhilePlaying && isPlaying) {
        const left =
          currentTime * (scaleWidth / scale) + startLeft - autoScrollFrom;
        // @ts-ignore
        timelineRef.current.setScrollLeft(left);
      }
    };
    window.addEventListener("js2video", listener);
    return () => window.removeEventListener("js2video", listener);
  }, []);

  useEffect(() => {
    if (!videoTemplate) {
      return;
    }
    setData([
      {
        id: "0",
        actions: [
          {
            id: "action0",
            start: videoTemplate.rangeStartTime,
            end: videoTemplate.rangeEndTime,
            maxEnd: videoTemplate.duration,
          },
        ],
      },
    ]);
  }, [videoTemplate]);

  return (
    <div className="flex-1">
      <Timeline
        ref={timelineRef}
        scale={scale}
        scaleWidth={scaleWidth}
        startLeft={startLeft}
        scaleSplitCount={10}
        onChange={(data) => setData(data)}
        editorData={data}
        effects={{}}
        style={{
          width: "100%",
          height: "80px",
          backgroundColor: "transparent",
        }}
        rowHeight={20}
        autoScroll={true}
        onScroll={(e) => {}}
        onClickTimeArea={(time) => {
          videoTemplate?.seek({ time });
          return true;
        }}
        onCursorDrag={(time) => {
          videoTemplate?.scrub({ time });
        }}
        onCursorDragEnd={async (time) => {
          await videoTemplate?.seek({ time });
        }}
        onActionResizeEnd={(e) => {
          const { start, end } = e;
          videoTemplate?.setTimeRange(start, end);
        }}
        onActionMoveEnd={(e) => {
          const { start, end } = e;
          videoTemplate?.setTimeRange(start, end);
        }}
        getActionRender={(action) => {
          return (
            <div
              className={`h-full justify-center items-center bg-blue-700 flex text-blue-400`}
            ></div>
          );
        }}
        getScaleRender={(scale) => <CustomScale scale={scale} />}
      />
    </div>
  );
};

const ControlButton = ({ children, ...rest }) => {
  const { isLoading } = useJS2Video();
  return (
    <button
      {...rest}
      disabled={isLoading}
      className={cn("p-2", { "opacity-60": isLoading })}
    >
      {children}
    </button>
  );
};

const ExportServerButton = () => {
  const { videoTemplate, onBeforeExport } = useJS2Video();
  const rangeStart = useRangeStart();
  const rangeEnd = useRangeEnd();

  // @ts-ignore
  const apiUrl = import.meta.env.VITE_EXPORT_API_URL;

  if (!apiUrl) {
    return;
  }

  const handleClick = async (e) => {
    if (onBeforeExport) {
      if (!(await onBeforeExport())) {
        return;
      }
    }

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
  const { videoTemplate, onBeforeExport } = useJS2Video();
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
    if (onBeforeExport) {
      if (!(await onBeforeExport())) {
        return;
      }
    }

    if (!canBrowserEncodeVideo()) {
      return alert(
        "Exporting videos from the browser is only supported in newer versions of Chrome on the desktop."
      );
    }

    // Create a new abort controller
    const controller = new AbortController();
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
            <div>Exporting MP4 to disk... {Math.round(progress * 100)}%</div>
            <button
              onClick={handleAbort}
              className="bg-black px-4 py-2 rounded text-sm"
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
  const { videoTemplate } = useJS2Video();
  const isPlaying = useIsPlaying();
  return (
    <ControlButton
      onClick={(e) => {
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
        await videoTemplate.rewind();
      }}
    >
      <RewindIcon size={22} />
    </ControlButton>
  );
};

/**
 * Simple playback controls
 * @returns {JSX.Element}
 */
const JS2VideoControls = () => {
  const [scale, setScale] = useState(2);
  const [scaleWidth, setScaleWidth] = useState(160);
  const scaleFactor = 0.5;

  return (
    <div className="flex flex-col bg-black">
      <div className="flex items-center px-2">
        <div className="flex-1 flex gap-4">
          <div className="flex">
            <RewindButton />
            <TogglePlayButton />
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => setScale(scale * scaleFactor)}
              className="opacity-60"
            >
              <ZoomInIcon />
            </button>
            <button
              onClick={(e) => setScale(scale * (1 / scaleFactor))}
              className="opacity-60"
            >
              <ZoomOutIcon />
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <CurrentTime />
        </div>
        <div className="flex-1 flex justify-end">
          <ExportButton />
          <ExportServerButton />
        </div>
      </div>
      <div>
        <Scrubber scale={scale} scaleWidth={scaleWidth} />
      </div>
    </div>
  );
};

export { JS2VideoControls };
