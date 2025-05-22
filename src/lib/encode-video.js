import {
  Muxer,
  StreamTarget,
  FileSystemWritableFileStreamTarget,
} from "mp4-muxer";
import { AVC } from "media-codecs";

async function encodeAudioBuffer(audioBuffer, audioEncoder) {
  const targetSampleRate = 48000;
  const numChannels = audioBuffer.numberOfChannels;
  const chunkSize = 1024;

  if (audioBuffer.sampleRate !== targetSampleRate) {
    const context = new OfflineAudioContext({
      numberOfChannels: numChannels,
      length: Math.ceil(audioBuffer.duration * targetSampleRate),
      sampleRate: targetSampleRate,
    });
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start();
    audioBuffer = await context.startRendering();
  }

  let sampleOffset = 0;
  for (let offset = 0; offset < audioBuffer.length; offset += chunkSize) {
    const length = Math.min(chunkSize, audioBuffer.length - offset);
    const interleaved = new Float32Array(length * numChannels);

    for (let i = 0; i < length; i++) {
      for (let c = 0; c < numChannels; c++) {
        interleaved[i * numChannels + c] =
          audioBuffer.getChannelData(c)[offset + i];
      }
    }

    const timestamp = Math.round((sampleOffset / targetSampleRate) * 1_000_000);
    sampleOffset += length;

    const audioData = new AudioData({
      format: "f32",
      sampleRate: targetSampleRate,
      numberOfChannels: numChannels,
      numberOfFrames: length,
      timestamp,
      data: interleaved,
    });

    audioEncoder.encode(audioData);
    audioData.close();
  }
}

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
    if (audioEncoder) {
      try {
        await audioEncoder.flush();
        audioEncoder.close();
      } catch (err) {
        console.warn(err);
      }
    }
    if (videoEncoder) {
      try {
        await videoEncoder.flush();
        videoEncoder.close();
      } catch (err) {
        console.warn(err);
      }
    }
    if (muxer) {
      try {
        muxer.finalize();
      } catch (err) {
        console.warn(err);
      }
    }
    if (fileStream) {
      try {
        await fileStream.close();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  try {
    const audioCodec = "mp4a.40.2";
    const videoCodec = AVC.getCodec({ profile: "Main", level: "5.2" });

    target = fileStream
      ? new FileSystemWritableFileStreamTarget(fileStream)
      : new StreamTarget({
          onData: async (chunk, position) => {
            await window.writeChunk(Array.from(chunk), position);
          },
        });

    muxer = new Muxer({
      fastStart: false,
      target,
      video: { codec: "avc", width, height },
      firstTimestampBehavior: "offset",
      ...(audioBuffer && {
        audio: {
          codec: "aac",
          numberOfChannels: audioBuffer.numberOfChannels,
          sampleRate: 48000,
        },
      }),
    });

    videoEncoder = new VideoEncoder({
      output: (chunk, meta) => {
        muxer.addVideoChunk(chunk, meta);
        hasReceivedOutput = true;
      },
      error: (e) => console.error(e),
    });

    const videoEncoderConfig = {
      codec: videoCodec,
      width,
      height,
      bitrate,
      contentHint: "detail",
    };

    await VideoEncoder.isConfigSupported(videoEncoderConfig);
    videoEncoder.configure(videoEncoderConfig);

    if (audioBuffer) {
      audioEncoder = new AudioEncoder({
        output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
        error: (e) => console.error(e),
      });

      const audioEncoderConfig = {
        codec: audioCodec,
        sampleRate: 48000,
        numberOfChannels: audioBuffer.numberOfChannels,
        bitrate: 128000,
      };

      await AudioEncoder.isConfigSupported(audioEncoderConfig);
      audioEncoder.configure(audioEncoderConfig);
      await encodeAudioBuffer(audioBuffer, audioEncoder);
    }

    let frame = 0;
    let currentFrame = 0;
    const frames = Math.round(timeline.duration() * fps) + 1;

    while (frame < frames) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const time = frame / fps;
      if (time > rangeEnd || time > timeline.duration()) break;

      if (time >= rangeStart) {
        await seek(time);
        const videoFrame = new VideoFrame(canvasElement, {
          timestamp: (time - rangeStart) * 1_000_000,
        });
        videoEncoder.encode(videoFrame, {
          keyFrame:
            currentFrame === 0 || currentFrame % Math.round(fps * 5) === 0,
        });
        videoFrame.close();
        if (hasReceivedOutput && currentFrame % Math.round(fps * 5) === 0) {
          await videoEncoder.flush();
        }
        progressHandler();
        currentFrame++;
      }
      frame++;
    }

    await close();
  } catch (err) {
    console.error(err);
    await close();
    throw err;
  }
}

export { encodeVideo };
