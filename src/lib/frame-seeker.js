import { Input, ALL_FORMATS, VideoSampleSink, UrlSource } from "mediabunny";

export class FrameSeeker {
  constructor(url) {
    this.url = url;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 100;
    this.canvas.height = 100;
    this.ctx = this.canvas.getContext("2d");
  }

  async seek(time) {
    if (!this.isActive) return;

    // create iterator once
    if (!this.samples) {
      this.samples = this.sink.samples(time);
      this.currentSample = await this.samples.next();
    }

    // Advance until we're at or past requested time
    while (!this.currentSample.done) {
      const sample = this.currentSample.value;
      if (!sample) {
        break;
      }
      if (sample.timestamp >= time) {
        // @ts-ignore
        if (!sample._closed) {
          sample.drawWithFit(this.ctx, { fit: "fill" });
          sample.close();
        }
        break;
      }
      // @ts-ignore
      if (!sample._closed) {
        sample.close();
      }
      this.currentSample = await this.samples.next();
    }
  }

  async start() {
    console.log("start frame seeker");
    this.input = new Input({
      source: new UrlSource(this.url),
      formats: ALL_FORMATS,
    });
    this.videoTrack = await this.input.getPrimaryVideoTrack();
    this.canvas.width = this.videoTrack.displayWidth;
    this.canvas.height = this.videoTrack.displayHeight;
    this.sink = new VideoSampleSink(this.videoTrack);
    this.isActive = true;
  }

  async stop() {
    console.log("stop frame seeker");
    if (this.samples) {
      await this.samples.return();
    }
    this.samples = null;
    this.currentSample = null;
    this.isActive = false;
  }

  async destroy() {
    console.log("destroy frame seeker");
  }
}
