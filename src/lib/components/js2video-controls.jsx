import { useJS2VideoEventProperty } from "./hooks/use-js2video-event-property";
import { useJS2Video } from "./js2video-provider";
import { canBrowserEncodeVideo, formatTime, cn, invlerp } from "../utils";
import {
  PlayIcon,
  PauseIcon,
  RewindIcon,
  SquareArrowDownIcon,
  ZoomInIcon,
  ZoomOutIcon,
  UnfoldHorizontalIcon,
  ScissorsLineDashedIcon,
  DownloadIcon,
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
    <div className="px-2 select-none font-mono text-sm opacity-70 whitespace-nowrap">
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  );
};

const CustomScale = ({ scale }) => {
  return <div className="select-none">{formatTime(scale)}</div>;
};

const Scrubber = ({
  videoTemplate,
  rangeStart,
  rangeEnd,
  duration,
  timelineRef,
  scale,
  scaleWidth,
}) => {
  const [data, setData] = useState([]);
  const startLeft = 32;

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
            start: rangeStart,
            end: rangeEnd,
            maxEnd: duration,
          },
        ],
      },
    ]);
  }, [rangeStart, rangeEnd, duration]);

  const actionRender = (action) => {
    return (
      <div
        className={`h-full select-none text-xs overflow-hidden justify-center items-center bg-blue-700 flex text-blue-400`}
      >
        {formatTime(rangeEnd - rangeStart)}
      </div>
    );
  };

  const scaleRender = (scale) => <CustomScale scale={scale} />;

  return (
    <div className="flex-1">
      <Timeline
        ref={timelineRef}
        scale={scale}
        scaleWidth={scaleWidth}
        startLeft={startLeft}
        scaleSplitCount={10}
        editorData={data}
        effects={{}}
        style={{
          width: "100%",
          height: "80px",
          backgroundColor: "transparent",
        }}
        rowHeight={20}
        autoScroll={true}
        onChange={(data) => {}}
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
        onActionResizing={(e) => {
          const { start, end } = e;
          videoTemplate?.setTimeRange(start, end);
        }}
        onActionMoveEnd={(e) => {
          const { start, end } = e;
          videoTemplate?.setTimeRange(start, end);
        }}
        getActionRender={actionRender}
        getScaleRender={scaleRender}
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
  const rangeStart = useRangeStart();
  const rangeEnd = useRangeEnd();
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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="flex flex-col items-center gap-4">
            <div>
              Exporting MP4 to disk...{" "}
              {Math.round(invlerp(rangeStart, rangeEnd, progress) * 100)}%
            </div>
            <button
              onClick={handleAbort}
              className="px-4 py-2 text-sm bg-black rounded"
            >
              Abort
            </button>
          </div>
        </div>
      )}

      <ControlButton onClick={handleClick}>
        <DownloadIcon size={26} />
      </ControlButton>
    </>
  );
};

const TogglePlayButton = () => {
  const { videoTemplate } = useJS2Video();
  const isPlaying = useIsPlaying();
  return (
    <ControlButton
      title="Play/Pause"
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
      title="Rewind"
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
  const { videoTemplate } = useJS2Video();
  const [scale, setScale] = useState(2);
  const [scaleWidth, setScaleWidth] = useState(160);
  const [duration, setDuration] = useState(0);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(0);
  const scaleFactor = 0.5;
  const timelineRef = useRef();

  // use a listener to update react-timeline-editor time
  useEffect(() => {
    const listener = (e) => {
      if (!timelineRef.current) {
        return;
      }
      const { type, videoTemplate: vt } = e.detail;
      if (vt && vt.rangeEndTime > 0) {
        setRangeStart(vt.rangeStartTime);
        setRangeEnd(vt.rangeEndTime);
        setDuration(vt.duration);
        // @ts-ignore
        timelineRef.current?.setTime(vt.currentTime);
      }
    };
    window.addEventListener("js2video", listener);
    return () => window.removeEventListener("js2video", listener);
  }, []);

  const scrollTimeline = (newScale) => {
    if (!timelineRef.current) {
      return;
    }
    // @ts-ignore
    const currentTime = timelineRef.current.getTime();
    const left = currentTime * (scaleWidth / newScale) + 33;
    // @ts-ignore
    timelineRef.current.setScrollLeft(Math.max(0, left - 400));
  };

  const zoomIn = (e) => {
    const newScale = scale * scaleFactor;
    scrollTimeline(newScale);
    setScale(newScale);
  };

  const zoomOut = (e) => {
    const newScale = scale * (1 / scaleFactor);
    scrollTimeline(newScale);
    setScale(newScale);
  };

  const setRangeStartToCurrentTime = (e) => {
    videoTemplate.setTimeRange(videoTemplate.currentTime, rangeEnd);
  };

  const setRangeEndToCurrentTime = (e) => {
    videoTemplate.setTimeRange(rangeStart, videoTemplate.currentTime);
  };

  const resetRange = (e) => {
    videoTemplate.setTimeRange(0, videoTemplate.duration);
  };

  return (
    <div className="flex flex-col bg-black">
      <div className="flex items-center px-2">
        <div className="flex flex-1 gap-8">
          <div className="flex">
            <RewindButton />
            <TogglePlayButton />
          </div>
          <div className="flex gap-2">
            <button
              title="Zoom in timeline"
              onClick={zoomIn}
              className="opacity-60 hover:opacity-80"
            >
              <ZoomInIcon />
            </button>
            <button
              title="Zoom out timeline"
              onClick={zoomOut}
              className="opacity-60 hover:opacity-80"
            >
              <ZoomOutIcon />
            </button>
          </div>
          <div className="flex gap-3">
            <button
              title="Set range start to playhead position"
              onClick={setRangeStartToCurrentTime}
              className="opacity-60 hover:opacity-80"
            >
              <ScissorsLineDashedIcon />
            </button>
            <button
              title="Set range end to playhead position"
              onClick={setRangeEndToCurrentTime}
              className="opacity-60 hover:opacity-80"
            >
              <ScissorsLineDashedIcon className="-rotate-180" />
            </button>
          </div>
          <button
            title="Reset range"
            onClick={resetRange}
            className="opacity-60 hover:opacity-80"
          >
            <UnfoldHorizontalIcon />
          </button>
        </div>
        <div className="flex justify-center flex-1">
          <CurrentTime />
        </div>
        <div className="flex justify-end flex-1">
          <ExportButton />
          <ExportServerButton />
        </div>
      </div>
      <div>
        <Scrubber
          videoTemplate={videoTemplate}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          duration={duration}
          timelineRef={timelineRef}
          scale={scale}
          scaleWidth={scaleWidth}
        />
      </div>
    </div>
  );
};

export { JS2VideoControls };
