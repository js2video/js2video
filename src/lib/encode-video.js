import {
  Output,
  Mp4OutputFormat,
  BufferTarget,
  getFirstEncodableVideoCodec,
  getFirstEncodableAudioCodec,
  AudioBufferSource,
  CanvasSource,
  QUALITY_HIGH,
  StreamTarget,
} from "mediabunny";
import { isPuppeteer } from "./utils";

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

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
}) {
  try {
    let target;

    if (isPuppeteer()) {
      target = new StreamTarget(
        new WritableStream({
          async write(chunk) {
            // @ts-ignore
            await window.writeChunk(Array.from(chunk.data), chunk.position);
          },
        })
      );
    } else {
      target = new BufferTarget();
    }

    let audioBufferSource = null;

    const output = new Output({
      format: new Mp4OutputFormat({
        fastStart: "in-memory",
      }),
      target,
    });

    const containableVideoCodecs = output.format.getSupportedVideoCodecs();

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const videoCodec = await getFirstEncodableVideoCodec(
      containableVideoCodecs,
      { width, height, bitrate }
    );

    if (!videoCodec) {
      throw new Error("Your browser doesn't support video encoding.");
    }

    const videoSource = new CanvasSource(canvasElement, {
      codec: videoCodec,
      bitrate,
      bitrateMode: "constant",
      latencyMode: "quality",
    });

    output.addVideoTrack(videoSource, { frameRate: fps });

    // @ts-ignore
    console.log(navigator?.userAgentData?.brands);

    if (audioBuffer) {
      // Force Opus on Safari, otherwise pick the first encodable codec
      let audioCodec;

      if (isSafari) {
        audioCodec = "opus";
      } else {
        audioCodec = await getFirstEncodableAudioCodec(
          output.format.getSupportedAudioCodecs(),
          {
            numberOfChannels: 2,
            sampleRate: 48000,
          }
        );
      }

      if (audioCodec) {
        audioBufferSource = new AudioBufferSource({
          // @ts-ignore
          codec: audioCodec,
          bitrate: QUALITY_HIGH,
        });
        output.addAudioTrack(audioBufferSource);
      } else {
        console.error(
          "Your browser doesn't support audio encoding, so we won't include audio in the output file."
        );
      }
    }

    await output.start();

    if (audioBufferSource) {
      await audioBufferSource.add(audioBuffer);
      audioBufferSource.close();
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
        await videoSource.add(time - rangeStart, 1 / fps);
        progressHandler();
        currentFrame++;
      }
      frame++;
    }

    // not necessary, but recommended
    videoSource.close();

    await output.finalize();

    // @ts-ignore
    return output?.target?.buffer;

    return;
  } catch (err) {
    console.error(err?.message ?? err);
    await close();
    throw err;
  }
}

export { encodeVideo };
