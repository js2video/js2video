import { demux } from "./mp4-demuxer";

export class FrameDecoder {
  constructor(url) {
    this.url = url;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.frameBuffer = [];
    this.startIndex = -1;
    this.flushed = false;
    this.file = null;
    this.trackId = null;
    this.samples = null;
  }

  async start() {
    if (!this.samples) {
      const {
        id: trackId,
        file,
        samples,
        codecConfig,
      } = await demux({
        url: this.url,
      });

      this.codecConfig = codecConfig;
      this.file = file;
      this.trackId = trackId;
      this.samples = samples;

      [this.canvas.width, this.canvas.height] = [
        // @ts-ignore
        codecConfig.displayWidth,
        // @ts-ignore
        codecConfig.displayHeight,
      ];
    }

    this.flushed = false;
    this.startIndex = -1;

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

    this.videoDecoder.configure(this.codecConfig);
  }

  async end() {
    await this.close();
  }

  findRapIndex(timestamp) {
    const offset = 0;
    for (let i = this.samples.length - 1; i >= 0; i--) {
      const sample = this.samples[i];
      const ts = (1e6 * (sample.cts - offset)) / sample.timescale;
      if (ts <= timestamp && this.samples[i].is_sync) {
        return i;
      }
    }
    // return 0 if none is found, as 0 is always rap
    return 0;
  }

  async decode(time) {
    const timestamp = time * 1e6;

    // first seek
    if (this.startIndex === -1) {
      if (time === 0) {
        this.startIndex = 0;
      } else {
        this.startIndex = this.findRapIndex(timestamp);
        console.log(
          "first seek rap",
          this.startIndex,
          this.samples[this.startIndex]
        );
      }
    }

    while (true) {
      // flush the decoder when there's no more chunks left,
      // so the framebuffer gets filled with the remaining frames
      if (this.startIndex >= this.samples.length && !this.flushed) {
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
        const sample = this.samples[this.startIndex];
        const offset = 0;
        // if we don't find a frame, decode a new chunk
        this.videoDecoder.decode(
          new EncodedVideoChunk({
            type: sample.is_sync ? "key" : "delta",
            timestamp: (1e6 * (sample.cts - offset)) / sample.timescale,
            duration: (1e6 * sample.duration) / sample.timescale,
            data: sample.data,
          })
        );
        this.startIndex++;
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

  async close() {
    if (this.videoDecoder) {
      try {
        this.frameBuffer.map((f) => f.close());
        while (this.frameBuffer.length > 0) {
          const frame = this.frameBuffer.shift();
          if (frame) {
            console.log("close frame", frame);
            try {
              frame.close();
            } catch (err) {
              console.log("close frame error", err);
            }
          }
        }
      } catch (e) {
        console.error(e.message);
      }
      try {
        await this.videoDecoder.flush();
        console.log("flushed decoder");
      } catch (e) {
        console.error(e.message);
      }
      try {
        this.videoDecoder.close();
        console.log("closed decoder");
      } catch (e) {
        console.error(e.message);
      }
    }
  }

  async destroy() {
    await this.close();
    this.file.releaseUsedSamples(this.trackId, this.samples.length);
    this.samples = null;
  }
}
