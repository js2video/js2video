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

export class FrameSeeker {
  constructor(url) {
    this.url = url;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.file = null;
    this.info = null;
    this.track = null;
    this.offset = 0;
    this.frameBuffer = [];
    this.lastSampleEncoded = -1;
    this.samples = null;
    this.rap = null;
    this.frameReady = null;
    this.isActive = false;
    this.firstSample = null;
  }

  onError(error) {
    console.error(error);
  }

  getChunk(sample) {
    const timestamp =
      (1e6 * (sample.cts - this.firstSample.cts)) / sample.timescale;
    const duration = (1e6 * sample.duration) / sample.timescale;
    const chunk = new EncodedVideoChunk({
      type: sample.is_sync ? "key" : "delta",
      timestamp: timestamp,
      duration: duration,
      data: sample.data,
    });
    return chunk;
  }

  async decodeSample(sample) {
    // console.log("decode sample", sample.number, sample.cts / sample.timescale);
    const chunk = this.getChunk(sample);
    this.videoDecoder.decode(chunk);
    this.lastSampleEncoded = sample.number;
    // this.file.releaseUsedSamples(this.track.id, sample.number);
    // a decode doesn't always output a frame. wait 200ms and move on
    try {
      await Promise.race([
        new Promise((r) => (this.frameReady = r)),
        new Promise((_, reject) =>
          setTimeout(() => reject("no frame outputted in 200ms"), 200)
        ),
      ]);
    } catch (err) {
      console.log(err);
    }
  }

  async loadSamples() {
    // load url and get all samples
    await new Promise((resolve) => {
      this.file = createFile();
      this.file.onError = this.onError.bind(this);
      this.file.onSamples = (id, user, samples) => {
        this.firstSample = samples[0];
        this.samples = samples;
        resolve();
      };
      this.file.onReady = (info) => {
        this.info = info;
        this.track = info.tracks.find((item) => item.type === "video");
        this.file.setExtractionOptions(this.track.id, null, {
          nbSamples: Infinity,
        });
        this.file.start();
        this.file.flush();
      };
      // load the whole video in one swoop to get all samples
      fetch(this.url)
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          // @ts-ignore
          buffer.fileStart = 0;
          this.file.appendBuffer(buffer);
        });
    });
  }

  async seek(time) {
    if (!this.isActive) {
      return;
    }

    // load samples and init decoder
    if (!this.samples) {
      await this.loadSamples();
    }

    // create the video decoder
    if (!this.videoDecoder) {
      this.videoDecoder = new VideoDecoder({
        output: (frame) => {
          console.log(`push frame to buffer: ${frame.timestamp / 1e6}`);
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
    }

    if (!this.rap) {
      this.rap =
        this.samples.reduce(
          (latest, obj) =>
            obj.is_sync && obj.cts / obj.timescale <= time ? obj : latest,
          null
        ) || this.firstSample;
      console.log(
        "FOUND RAP",
        this.rap.number,
        this.rap.cts / this.rap.timescale
      );
      await this.decodeSample(this.rap);
    }

    // console.log("last encoded", this.lastSampleEncoded);

    // loop until we decode / find a frame in the buffer
    for (const sample of this.samples) {
      if (sample.number > this.lastSampleEncoded) {
        const frameIndex = this.frameBuffer.findIndex(
          (f) => f.timestamp >= time * 1e6
        );
        if (frameIndex === -1) {
          this.clearFrameBuffer();
          await this.decodeSample(sample);
        } else {
          const frame = this.frameBuffer[frameIndex];
          // console.log("draw frame:", frame.timestamp / 1e6);
          this.ctx.drawImage(frame, 0, 0);
          break;
        }
      }
    }
  }

  clearFrameBuffer() {
    this.frameBuffer.map((f) => {
      // console.log("close frame", f.timestamp);
      f.close();
    });
    this.frameBuffer = [];
  }

  async start() {
    console.log("start frame seeker");
    this.clearFrameBuffer();
    this.isActive = true;
  }

  async stop() {
    console.log("stop frame seeker");
    this.isActive = false;
    this.rap = null;
    this.lastSampleEncoded = -1;
    this.clearFrameBuffer();
    await this.videoDecoder.flush();
    this.videoDecoder.close();
    this.videoDecoder = null;
  }

  async destroy() {
    console.log("destroy frame seeker");
    await this.stop();
  }
}
