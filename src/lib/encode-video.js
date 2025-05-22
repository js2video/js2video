import {
  Muxer,
  StreamTarget,
  FileSystemWritableFileStreamTarget,
} from "mp4-muxer";
import { AVC } from "media-codecs";

function audioBufferToAudioData(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const interleaved = new Int16Array(length * numChannels);

  for (let i = 0; i < length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = audioBuffer.getChannelData(c)[i];
      // Clamp float [-1.0, 1.0] to int16 [-32768, 32767]
      interleaved[i * numChannels + c] =
        Math.max(-1, Math.min(1, sample)) * 32767;
    }
  }

  return new AudioData({
    format: "s16",
    sampleRate: audioBuffer.sampleRate,
    numberOfFrames: length,
    numberOfChannels: numChannels,
    timestamp: 0,
    data: interleaved,
  });
}
/**
 * Exports a video template to MP4
 * @param {Object} options
 * @param {number} options.bitrate
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} options.fps
 * @param {number} options.rangeStart
 * @param {number} options.rangeEnd
 * @param {Function} options.seek
 * @param {gsap.core.Timeline} options.timeline
 * @param {HTMLCanvasElement} options.canvasElement
 * @param {Function} options.progressHandler
 * @param {AudioBuffer} [options.audioBuffer]
 * @param {AbortSignal} [options.signal] - The signal that can be used to abort the export process.
 * @param {FileSystemWritableFileStream} [options.fileStream]
 */
async function encodeVideo({
  bitrate,
  width,
  height,
  fps,
  rangeStart,
  rangeEnd,
  seek,
  timeline,
  canvasElement,
  progressHandler,
  audioBuffer,
  signal,
  fileStream,
}) {
  let muxer, audioEncoder, videoEncoder, target, hasReceivedOutput;

  async function close() {
    console.log("closing encoders");

    if (audioEncoder) {
      try {
        console.log("flushing audio encoder");
        await audioEncoder.flush();
        audioEncoder.close();
        console.log("closed audioEncoder");
      } catch (err) {
        console.warn(err);
      }
    }
    if (videoEncoder) {
      try {
        console.log("flushing video encoder");
        await videoEncoder.flush();
        videoEncoder.close();
        console.log("closed videoEncoder");
      } catch (err) {
        console.warn(err);
      }
    }
    if (muxer) {
      try {
        console.log("finalize muxer");
        muxer.finalize();
        console.log("finalized muxer");
      } catch (err) {
        console.warn(err);
      }
    }
    if (fileStream) {
      try {
        console.log("closing file stream");
        await fileStream.close();
        console.log("closed file stream");
      } catch (err) {
        console.warn(err);
      }
    }
  }

  try {
    const audioCodec = "mp4a.40.2";
    const videoCodec = AVC.getCodec({ profile: "Main", level: "5.2" });

    console.log("audio codec", audioCodec);
    console.log("video codec", videoCodec);

    if (!fileStream) {
      target = new StreamTarget({
        onData: async (chunk, position) => {
          // see puppeteer
          // @ts-ignore
          await window.writeChunk(Array.from(chunk), position);
        },
      });
    } else {
      target = new FileSystemWritableFileStreamTarget(fileStream);
    }

    console.log("target created");

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

    console.log("muxer created", muxerOptions);

    videoEncoder = new VideoEncoder({
      output: (chunk, meta) => {
        muxer.addVideoChunk(chunk, meta);
        if (!hasReceivedOutput) {
          console.log("frame outputted", chunk, meta);
        }
        hasReceivedOutput = true;
      },
      error: (e) => console.error(e),
    });

    const videoEncoderConfig = {
      codec: videoCodec,
      width: width,
      height: height,
      bitrate: bitrate,
      contentHint: "detail",
    };

    const videoConfigTest = await VideoEncoder.isConfigSupported(
      videoEncoderConfig
    );

    console.log("video encoder config supported?", videoConfigTest);

    videoEncoder.configure(videoEncoderConfig);

    console.log("video encoder created", videoEncoderConfig, performance.now());

    if (audioBuffer) {
      audioEncoder = new AudioEncoder({
        output: (chunk, meta) => {
          muxer.addAudioChunk(chunk, meta);
        },
        error: (e) => console.error(e),
      });

      const audioEncoderConfig = {
        codec: audioCodec,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        bitrate: 192000, // 192 kbps
      };

      const audioConfigTest = await AudioEncoder.isConfigSupported(
        audioEncoderConfig
      );

      console.log("audio encoder config supported?", audioConfigTest);

      audioEncoder.configure(audioEncoderConfig);

      console.log("audio encoder created", audioEncoderConfig);

      audioEncoder.encode(audioBufferToAudioData(audioBuffer));

      await audioEncoder.flush();
      audioEncoder.close();

      console.log("flushed + closed audioencoder");
    }

    let frame = 0;
    let currentFrame = 0;
    const frames = Math.round(timeline.duration() * fps) + 1;

    // loop through and encode all frames
    while (frame < frames) {
      if (typeof signal !== "undefined" && signal.aborted) {
        throw new DOMException("The operation was aborted", "AbortError");
      }
      const time = frame / fps;
      if (time > rangeEnd || time > timeline.duration()) {
        break;
      }
      if (time >= rangeStart) {
        // update timeline + canvas
        await seek(time);
        // grab the canvas into a frame
        const videoFrame = new VideoFrame(canvasElement, {
          timestamp: (time - rangeStart) * 1000 * 1000,
        });
        // TODO: maybe make this user configurable?
        // Frequent flushes/keyframes = larger sizes. 5s is a OK setting.
        // keyframe first and every 5s
        videoEncoder.encode(videoFrame, {
          keyFrame:
            currentFrame === 0 || currentFrame % Math.round(fps * 5) === 0,
        });
        // flush every keyframe
        videoFrame.close();
        if (hasReceivedOutput && currentFrame % Math.round(fps * 5) === 0) {
          console.log("video frame flush", frame, frames, performance.now());
          await videoEncoder.flush();
          console.log("video frame flushed", frame, frames, performance.now());
        }
        progressHandler();
        currentFrame++;
      }
      frame++;
    }

    await close();

    return;
  } catch (err) {
    console.error(err?.message ?? err);
    await close();
    throw err;
  }
}

export { encodeVideo };
