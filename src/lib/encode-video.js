import {
  Muxer,
  StreamTarget,
  FileSystemWritableFileStreamTarget,
} from "mp4-muxer";
import { AVC } from "media-codecs";
import { canBrowserEncodeVideo, isPuppeteer } from "./utils";

function audioBufferToAudioData(audioBuffer) {
  // Create a new Float32Array to hold the planar audio data
  const numChannels = audioBuffer.numberOfChannels;
  const lengthPerChannel = audioBuffer.length;
  const planarData = new Float32Array(numChannels * lengthPerChannel);
  // Fill the Float32Array with planar audio data
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    planarData.set(channelData, channel * lengthPerChannel);
  }
  // Construct an AudioData object
  const audioData = new AudioData({
    format: "f32-planar",
    sampleRate: audioBuffer.sampleRate,
    numberOfFrames: lengthPerChannel,
    numberOfChannels: audioBuffer.numberOfChannels,
    timestamp: 0,
    data: planarData,
  });
  return audioData;
}

/**
 * Exports a video template to MP4
 * @param {Object} options
 * @param {number} options.bitrate
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.fps
 * @param {Function} options.seek
 * @param {gsap.core.Timeline} options.timeline
 * @param {HTMLCanvasElement} options.canvasElement
 * @param {Function} options.progressHandler
 * @param {string} options.filePrefix
 * @param {AudioBuffer} [options.audioBuffer]
 * @param {AbortSignal} [options.signal] - The signal that can be used to abort the export process.
 */
async function encodeVideo({
  bitrate,
  width,
  height,
  fps,
  seek,
  timeline,
  canvasElement,
  progressHandler,
  filePrefix,
  audioBuffer,
  signal,
}) {
  let muxer, audioEncoder, videoEncoder, target, fileWritableStream, fileHandle;

  async function close() {
    if (audioEncoder) {
      try {
        await audioEncoder.flush();
        audioEncoder.close();
        console.log("closed audioEncoder");
      } catch (err) {
        console.warn(err);
      }
    }
    if (videoEncoder) {
      try {
        await videoEncoder.flush();
        videoEncoder.close();
        console.log("closed videoEncoder");
      } catch (err) {
        console.warn(err);
      }
    }
    if (muxer) {
      try {
        muxer.finalize();
        console.log("finalized muxer");
      } catch (err) {
        console.warn(err);
      }
    }
    if (fileWritableStream) {
      try {
        await fileWritableStream.close();
        console.log("closed fileWritableStream");
      } catch (err) {
        console.warn(err);
      }
    }
  }

  try {
    const audioCodec = "mp4a.40.2";
    const videoCodec = AVC.getCodec({ profile: "Main", level: "5.2" });

    if (isPuppeteer()) {
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
      fileHandle = await window.showSaveFilePicker({
        suggestedName: `${filePrefix}-${Date.now()}.mp4`,
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
      ...(audioBuffer && {
        audio: {
          codec: "aac",
          numberOfChannels: audioBuffer.numberOfChannels,
          sampleRate: audioBuffer.sampleRate,
        },
      }),
    };

    // @ts-ignore
    muxer = new Muxer(muxerOptions);

    videoEncoder = new VideoEncoder({
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

    if (audioBuffer) {
      audioEncoder = new AudioEncoder({
        output: (chunk, meta) => {
          const time = chunk.timestamp / 1000 / 1000;
          if (time <= timeline.duration()) {
            muxer.addAudioChunk(chunk, meta);
          }
        },
        error: (e) => console.error(e),
      });

      audioEncoder.configure({
        codec: audioCodec,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        bitrate: 192000, // 192 kbps
      });

      audioEncoder.encode(audioBufferToAudioData(audioBuffer));
      await audioEncoder.flush();
      audioEncoder.close();
      console.log("flushed + closed audioencoder");
    }

    let frame = 0;
    let frames = Math.round(timeline.duration() * fps) + 1;

    // loop through and encode all frames
    while (frame < frames) {
      if (typeof signal !== "undefined" && signal.aborted) {
        throw new DOMException("The operation was aborted", "AbortError");
      }
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
      await progressHandler({ progress: timeline.progress() });
      frame++;
    }

    await close();

    return;
  } catch (err) {
    await close();
    throw err;
  }
}

export { encodeVideo };
