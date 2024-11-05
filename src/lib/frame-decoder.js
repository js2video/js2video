import { demux } from "./mp4-demuxer";

export class FrameDecoder {
  constructor(url) {
    this.url = url;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.frameBuffer = [];
    this.startIndex = 0;
    this.flushed = false;
  }

  async init() {
    if (this.initPromise || this.videoDecoder) return this.initPromise;

    this.initPromise = (async () => {
      const { chunks, codecConfig } = await demux({ url: this.url });
      this.chunks = chunks;
      [this.canvas.width, this.canvas.height] = [
        // @ts-ignore
        codecConfig.displayWidth,
        // @ts-ignore
        codecConfig.displayHeight,
      ];

      this.videoDecoder = new VideoDecoder({
        output: (frame) => {
          // push the frame to the buffer so we can pick it from there.
          // we use a buffer because frames later than the one we're after can be outputted as well,
          // so we need to keep it around.
          this.frameBuffer.push(frame);
          // resolve and clear the deferred promise when a frame is outputted.
          this.frameReady?.();
          this.frameReady = null;
        },
        error: console.error,
      });
      this.videoDecoder.configure(codecConfig);
      this.initPromise = null;
    })();

    return this.initPromise;
  }

  async decode(time) {
    await this.init();
    const timestamp = time * 1e6;

    while (true) {
      // flush the decoder when there's no more chunks left,
      // so the framebuffer gets filled with the remaining frames
      if (this.startIndex >= this.chunks.length && !this.flushed) {
        this.flushed = true;
        await this.videoDecoder.flush();
      }

      // find the frame in the framebuffer
      const frameIndex = this.frameBuffer.findIndex(
        (f) => f.timestamp >= timestamp
      );

      // no frame found in buffer
      if (frameIndex === -1) {
        if (this.flushed) {
          return;
        }
        // if we don't find a frame, decode a new chunk
        this.videoDecoder.decode(this.chunks[this.startIndex++]);
        // wait until the frame is outputted.
        // not all chunks output a frame, so timeout after 30ms.
        await Promise.race([
          new Promise((r) => (this.frameReady = r)),
          new Promise((r) => setTimeout(r, 30)),
        ]);
        // frame found in buffer
      } else {
        // clean up stale frames, but keep the current, we might want to re-use it.
        for (let i = 0; i < frameIndex; i++) {
          this.frameBuffer.shift().close();
        }
        // draw the frame on the canvas
        this.ctx.drawImage(this.frameBuffer[0], 0, 0);
        return;
      }
    }
  }

  async destroy() {
    if (this.videoDecoder) {
      try {
        await this.videoDecoder.flush();
      } catch (e) {
        console.error(e.message);
      }
      try {
        this.videoDecoder.close();
      } catch (e) {
        console.error(e.message);
      }
    }
  }
}
