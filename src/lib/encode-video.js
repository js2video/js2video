import {
  Muxer,
  StreamTarget,
  FileSystemWritableFileStreamTarget,
} from "mp4-muxer";
import { AVC } from "media-codecs";
import { canBrowserEncodeVideo } from "./utils";

async function encodeVideo({
  bitrate,
  width,
  height,
  fps,
  seek,
  timeline,
  canvasElement,
  isPuppeteer,
  progressHandler = () => {},
}) {
  console.log("fps", fps);

  const videoCodec = AVC.getCodec({ profile: "Main", level: "5.2" });
  const audioCodec = "mp4a.40.2";

  let target, fileWritableStream;

  if (isPuppeteer) {
    target = new StreamTarget({
      onData: async (chunk, position) => {
        // see puppeteer
        // @ts-ignore
        await window.writeChunk(Array.from(chunk), position);
      },
    });
  } else {
    if (!canBrowserEncodeVideo()) {
      throw "This browser cannot encode video yet. Please try Chrome/Chromium";
    }
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: `js2video-${Date.now()}.mp4`,
      types: [
        {
          description: "Video File",
          accept: { "video/mp4": [".mp4"] },
        },
      ],
    });
    fileWritableStream = await fileHandle.createWritable();
    target = new FileSystemWritableFileStreamTarget(fileWritableStream);
  }

  const muxerOptions = {
    fastStart: false,
    target,
    video: {
      codec: "avc",
      width: width,
      height: height,
    },
    firstTimestampBehavior: "offset",
  };

  // @ts-ignore
  const muxer = new Muxer(muxerOptions);

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (e) => console.error(e),
  });

  videoEncoder.configure({
    codec: videoCodec,
    width: width,
    height: height,
    bitrate: bitrate,
    latencyMode: "quality",
  });

  let frame = 0;
  let frames = Math.round(timeline.duration() * fps) + 1;

  // loop through and encode all frames
  while (frame < frames) {
    const time = frame / fps;
    // update timeline
    await seek(Math.min(time, timeline.duration()));
    // grab the canvas into a frame
    const videoFrame = new VideoFrame(canvasElement, {
      timestamp: time * 1000 * 1000,
    });
    // TODO: maybe make this user configurable?
    // Frequent flushes/keyframes = larger sizes. 5s is a OK setting.
    // keyframe first and every 5s
    videoEncoder.encode(videoFrame, {
      keyFrame: frame === 0 || frame % Math.round(fps * 5) === 0,
    });
    // flush every keyframe
    videoFrame.close();
    if (frame % Math.round(fps * 5) === 0) {
      await videoEncoder.flush();
    }
    progressHandler();
    frame++;
  }

  console.log("videoencoder done");
  await videoEncoder.flush();
  console.log("videoencoder flushed");

  muxer.finalize();
  console.log("muxer finalized");

  if (fileWritableStream) {
    await fileWritableStream.close();
    console.log("file closed");
  }
}

export { encodeVideo };
