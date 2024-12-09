import { StaticCanvas } from "fabric";
import { gsap } from "gsap";
import * as utils from "./lib/template-utils";
import * as canvasUtils from "./lib/fabric-utils";

/**
 * Video template function
 * @param {Object} options
 * @param {StaticCanvas} options.canvas
 * @param {gsap.core.Timeline} options.timeline
 * @param {Object} options.params
 * @param {utils} options.utils
 * @param {canvasUtils} options.canvasUtils
 */
const templateFunction = async ({
  canvas,
  timeline,
  params,
  utils,
  canvasUtils,
}) => {};

export { templateFunction, StaticCanvas, canvasUtils, utils };
