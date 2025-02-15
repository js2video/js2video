import { createFile, DataStream } from "mp4box";

const description = (track, file) => {
  const trackInfo = file.getTrackById(track.id);
  for (const entry of trackInfo.mdia.minf.stbl.stsd.entries) {
    if (entry.avcC || entry.hvcC) {
      const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
      (entry.avcC || entry.hvcC).write(stream);
      return new Uint8Array(stream.buffer, 8);
    }
  }
};

class MP4FileSink {
  constructor(file) {
    this.offset = 0;
    this.file = file;
  }
  write(chunk) {
    const buffer = new ArrayBuffer(chunk.byteLength);
    new Uint8Array(buffer).set(chunk);
    // @ts-ignore
    buffer.fileStart = this.offset;
    this.offset += buffer.byteLength;
    this.file.appendBuffer(buffer);
  }
  close() {
    this.file.flush();
  }
}

export class FrameSeeker {
  constructor(url) {
    this.url = url;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.file = null;
    this.info = null;
    this.track = null;
    this.offset = 512;
    this.lastSeeked = Infinity;
    this.inited = false;
    this.frameBuffer = [];
  }

  onError(error) {
    console.error(error);
  }

  // get the next sample from the mp4box file
  async getNextSample() {
    const sample = await new Promise((resolve) => {
      this.file.onSamples = (id, user, samples) => {
        this.file.stop();
        resolve(samples[0]);
      };
      this.file.start();
    });
    return sample;
  }

  async decodeNextSample() {
    // if we don't get a sample in 2s assume we're done
    // a bit hackish, as it adds 2s to every export.
    // TODO: find a better way to check if there are no more samples left.
    let sample = await Promise.race([
      this.getNextSample(),
      new Promise((_, reject) =>
        setTimeout(() => reject("no samples left"), 2000)
      ),
    ]);
    const start = (1e6 * sample.cts - this.offset) / sample.timescale;
    const duration = (1e6 * sample.duration) / sample.timescale;
    // console.log(`s (${sample.number}): ${start}`);
    this.videoDecoder.decode(
      new EncodedVideoChunk({
        type: sample.is_sync ? "key" : "delta",
        timestamp: start,
        duration: duration,
        data: sample.data,
      })
    );
    // clear sample from memory
    this.file.releaseUsedSamples(this.track.id, sample.number);
    // a decode doesn't always output a frame. wait 100ms and move on
    try {
      await Promise.race([
        new Promise((r) => (this.frameReady = r)),
        new Promise((_, reject) =>
          setTimeout(() => reject("no frame outputted in 100ms"), 100)
        ),
      ]);
    } catch (err) {
      console.log(err);
    }
  }

  async init() {
    if (!this.inited) {
      console.log("frame seeker initing");

      this.inited = true;

      // load file with info, wait until it's ready
      await new Promise((resolve) => {
        this.file = createFile();
        this.file.onError = this.onError.bind(this);
        this.file.onReady = (info) => {
          this.info = info;
          this.track = info.tracks.find((item) => item.type === "video");
          this.file.setExtractionOptions(this.track.id, null, {
            nbSamples: 1, // we only want one sample at the time!
          });
          resolve();
        };
        this.fileSink = new MP4FileSink(this.file);
        fetch(this.url).then((response) =>
          response.body.pipeTo(
            new WritableStream(this.fileSink, { highWaterMark: 2 })
          )
        );
      });

      // get first sample to find offset
      this.file.seek(0, true);
      const firstSample = await this.getNextSample();
      this.offset = firstSample.offset;

      // create the video decoder
      this.videoDecoder = new VideoDecoder({
        output: (frame) => {
          // console.log(`f: ${frame.timestamp}`);
          this.frameBuffer.push(frame);
          this.frameReady?.();
          this.frameReady = null;
        },
        error: console.error,
      });

      // configure the video decoder
      this.videoDecoder.configure({
        codec: this.track.codec,
        codedWidth: this.track.video.width,
        codedHeight: this.track.video.height,
        description: description(this.track, this.file),
        optimizeForLatency: true,
        hardwareAcceleration: "prefer-hardware",
      });

      // resize canvas to match video
      [this.canvas.width, this.canvas.height] = [
        this.track.video.width,
        this.track.video.height,
      ];

      console.log("frame seeker inited");
    }
  }

  async seek(time) {
    await this.init();

    // seek to rap if time < last seeked.
    // decodeNextFrame() will start at that position
    if (time < this.lastSeeked) {
      const rap = this.file.seek(time, true);
      console.log({ rap, time });
      this.lastSeeked = time;
    }

    // loop until we decode / find a frame in the buffer
    for (let i = 0; i < 1e6; i++) {
      // find the frame in the framebuffer
      const frameIndex = this.frameBuffer.findIndex(
        (f) => f.timestamp >= time * 1e6
      );
      // decode next sample if we didn't find a frame
      if (frameIndex === -1) {
        // throwing when we're done
        try {
          await this.decodeNextSample();
        } catch (err) {
          console.error(err);
          await this.videoDecoder.flush();
          break;
        }
      } else {
        let frame = this.frameBuffer[0];
        // console.log(`t: ${time * 1e6} = ${frameIndex} = ${frame.timestamp}`);
        // remove and close stale frames,
        // but keep the current as we might want to re-use it.
        for (let i = 0; i < frameIndex; i++) {
          const frame = this.frameBuffer.shift();
          frame.close();
        }
        // draw frame to canvas
        this.ctx.drawImage(this.frameBuffer[0], 0, 0);
        break;
      }
    }
  }

  async stop() {
    console.log("stop frame seeker");
    this.lastSeeked = Infinity;
    try {
      this.file?.flush();
    } catch (err) {
      console.warn(err);
    }
    try {
      this.file?.releaseUsedSamples(this.track.id, this.track.nb_samples);
    } catch (err) {
      console.warn(err);
    }
    try {
      await this?.videoDecoder?.flush();
    } catch (err) {
      console.warn(err);
    }
    while (this.frameBuffer.length > 0) {
      const frame = this.frameBuffer.shift();
      if (frame) {
        console.log("close frame", frame);
        try {
          frame.close();
        } catch (err) {
          console.warn("close frame error", err);
        }
      }
    }
  }

  async destroy() {
    console.log("destroy frame seeker");
    await this.stop();
    try {
      this.inited = false;
      if (this.track) {
        this.track.samples = [];
      }
      if (this.file) {
        this.file.mdats = [];
        this.file.moofs = [];
      }
    } catch (err) {
      console.warn(err);
    }
  }
}
