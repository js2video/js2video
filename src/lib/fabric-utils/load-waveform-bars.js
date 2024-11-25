import { FabricObject } from "fabric";
import { lerp } from "../utils";
import { JS2VideoMixin } from "./js2video-mixin";
import { scaleBand, range } from "d3";

/**
 * @enum {string}
 */
const Orientation = {
  VERTICAL: "vertical",
  HORIZONTAL: "horizontal",
};

/**
 * @enum {string}
 */
const Anchor = {
  BOTTOM: "bottom",
  TOP: "top",
  CENTER: "center",
  RIGHT: "right",
};

class JS2VideoWaveformBars extends JS2VideoMixin(FabricObject) {
  static type = "js2video_waveform_bars";

  /**
   * Create an instance of the JS2VideoWaveformBars class
   * @param {Object} audio
   * @param {Object} options
   * @param {number} [paddingInner]
   * @param {number} [paddingOuter]
   * @param {Orientation} [orientation=Orientation.VERTICAL]
   * @param {Anchor} [anchor]
   * @param {boolean} [roundedCaps]
   */
  constructor(
    audio,
    options,
    paddingInner = 0,
    paddingOuter = 0,
    orientation = Orientation.VERTICAL,
    anchor = Anchor.BOTTOM,
    roundedCaps = false
  ) {
    super(options);
    super.set({
      objectCaching: false,
    });
    this.js2video_roundedCaps = roundedCaps;
    this.js2video_orientation = orientation;
    this.js2video_anchor = anchor;
    this.js2video_audio = audio;
    this.js2video_barSize = scaleBand()
      .paddingInner(paddingInner)
      .paddingOuter(paddingOuter)
      .domain(range(audio.bins[0].length).map(String))
      .range([
        0,
        orientation === Orientation.VERTICAL ? this.width : this.height,
      ]);
    this.js2video_barThickness = this.js2video_barSize.bandwidth();
  }

  _render(ctx) {
    if (!this.js2video_timeline) {
      return;
    }
    const currentFrame = Math.round(
      this.js2video_timeline.time() * this.js2video_params.fps
    );
    if (currentFrame >= this.js2video_audio.bins.length) {
      return;
    }
    const frameBins = this.js2video_audio.bins[currentFrame];
    // draw bars
    ctx.save();
    ctx.fillStyle = this.fill;
    for (var i = 0; i < frameBins.length; i++) {
      if (this.js2video_orientation === Orientation.VERTICAL) {
        const h = -lerp(0, this.height, frameBins[i]);
        const w = this.js2video_barThickness;
        const x = this.js2video_barSize(`${i}`) - this.width / 2;
        let y = 0;
        if (this.js2video_anchor === "bottom") {
          y = this.height / 2;
        } else if (this.js2video_anchor === "top") {
          y = -(h + this.height / 2);
        } else if (this.js2video_anchor === "center") {
          y = -h / 2;
        } else {
          throw `Invalid anchor: ${this.js2video_anchor}`;
        }
        ctx.fillRect(x, y, w, h);
        if (this.js2video_roundedCaps) {
          ctx.beginPath();
          ctx.arc(x + w / 2, y, w / 2, 0, 2 * Math.PI);
          ctx.moveTo(x + w / 2, y + h);
          ctx.arc(x + w / 2, y + h, w / 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      } else {
        const h = this.js2video_barThickness;
        const w = -lerp(0, this.width, frameBins[i]);
        const y = this.js2video_barSize(`${i}`) - this.height / 2;
        let x = 0;
        if (this.js2video_anchor === "right") {
          x = this.width / 2;
        } else if (this.js2video_anchor === "left") {
          x = -(w + this.width / 2);
        } else if (this.js2video_anchor === "center") {
          x = -w / 2;
        } else {
          throw `Invalid anchor: ${this.js2video_anchor}`;
        }
        ctx.fillRect(x, y, w, h);
        if (this.js2video_roundedCaps) {
          ctx.beginPath();
          ctx.arc(x, y + h / 2, h / 2, 0, 2 * Math.PI);
          ctx.moveTo(x + w, y + h / 2);
          ctx.arc(x + w, y + h / 2, h / 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }
}

async function loadWaveformBars({
  audio,
  paddingInner = 0.2,
  paddingOuter = 0,
  orientation = Orientation.VERTICAL,
  anchor = Anchor.BOTTOM,
  options = {},
  roundedCaps = false,
}) {
  const obj = new JS2VideoWaveformBars(
    audio,
    options,
    paddingInner,
    paddingOuter,
    orientation,
    anchor,
    roundedCaps
  );
  return obj;
}

export { loadWaveformBars };
