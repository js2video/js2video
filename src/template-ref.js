import { StaticCanvas } from "fabric";
import { gsap } from "gsap";
import * as utils from "./lib/template-utils";
import * as canvasUtils from "./lib/fabric-utils";
import * as Pixi from "pixi.js";
import * as PixiFilters from "pixi-filters";
import * as Fabric from "fabric";

/**
 * Video template function
 * @param {Object} options
 * @param {gsap} options.gsap
 * @param {gsap.core.Timeline} options.timeline
 * @param {StaticCanvas} options.canvas
 * @param {HTMLElement} options.canvasElement
 * @param {Object} options.params
 * @param {Fabric} options.Fabric
 * @param {Pixi} options.Pixi
 * @param {PixiFilters} options.PixiFilters
 * @param {utils} options.utils
 * @param {canvasUtils} options.canvasUtils
 */
const templateFunction = async ({
  gsap,
  timeline,
  canvas,
  canvasElement,
  params,
  Fabric,
  Pixi,
  PixiFilters,
  utils,
  canvasUtils,
}) => {};

export { templateFunction, StaticCanvas, utils, canvasUtils };
