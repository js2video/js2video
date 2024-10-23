import { demux } from "./mp4-demuxer";

const FRAME_BUFFER_SIZE = 3;

export class VideoRenderer {
  constructor(url) {
    this.url = url;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.chunks = [];
    this.frameBuffer = [];
    this.inited = false;
    this.nextChunkIndex = 0;
    this.isFillingBuffer = false;
  }

  async init() {
    if (this.inited) return;
    this.inited = true;

    const { samples, codecConfig } = await demux({ url: this.url });

    // @ts-ignore
    this.canvas.width = codecConfig.displayWidth;
    // @ts-ignore
    this.canvas.height = codecConfig.displayHeight;

    this.chunks = samples.map(
      (sample) =>
        new EncodedVideoChunk({
          type: sample.is_sync ? "key" : "delta",
          timestamp: (1e6 * sample.cts) / sample.timescale,
          duration: (1e6 * sample.duration) / sample.timescale,
          data: sample.data,
        })
    );

    this.videoDecoder = new VideoDecoder({
      output: this.bufferFrame.bind(this),
      error: (e) => console.error("Decoder error:", e),
    });
    this.videoDecoder.configure(codecConfig);
    this.fillFrameBuffer();
  }

  bufferFrame(frame) {
    this.frameBuffer.push(frame);
  }

  pickFrame(time) {
    const timestamp = time * 1e6;
    if (this.frameBuffer.length === 0) return null;

    let closestFrameIndex = -1;
    let minTimeDelta = Number.MAX_VALUE;

    // Find the closest frame
    for (let i = 0; i < this.frameBuffer.length; i++) {
      const timeDelta = Math.abs(timestamp - this.frameBuffer[i].timestamp);
      if (timeDelta < minTimeDelta) {
        minTimeDelta = timeDelta;
        closestFrameIndex = i;
      } else {
        break; // Frames are sorted, can exit early
      }
    }

    // Drop stale frames
    for (let i = 0; i < closestFrameIndex; i++) {
      this.frameBuffer.shift().close();
    }

    return closestFrameIndex === -1 ? null : this.frameBuffer[0];
  }

  nextChunk() {
    return this.nextChunkIndex < this.chunks.length
      ? this.chunks[this.nextChunkIndex++]
      : null;
  }

  isFrameBufferFull() {
    return this.frameBuffer.length >= FRAME_BUFFER_SIZE;
  }

  async waitUntilFrameBufferIsFull() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.isFrameBufferFull()) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    });
  }

  fillFrameBuffer() {
    if (this.isFillingBuffer) return;
    this.isFillingBuffer = true;

    const fillBuffer = () => {
      if (this.isFrameBufferFull()) {
        this.isFillingBuffer = false;
        setTimeout(fillBuffer, 10);
        return;
      }

      while (
        this.frameBuffer.length < FRAME_BUFFER_SIZE &&
        this.videoDecoder.decodeQueueSize < FRAME_BUFFER_SIZE
      ) {
        const chunk = this.nextChunk();
        if (!chunk) {
          this.isFillingBuffer = false;
          return;
        }
        this.videoDecoder.decode(chunk);
      }

      this.isFillingBuffer = false;
      setTimeout(fillBuffer, 10);
    };

    fillBuffer();
  }

  async render(time) {
    await this.init();
    await this.waitUntilFrameBufferIsFull();

    console.log(this.frameBuffer.length);

    const frame = this.pickFrame(time);
    if (frame) {
      this.ctx.drawImage(frame, 0, 0);
    } else {
      console.log("no frame");
    }
  }
}
