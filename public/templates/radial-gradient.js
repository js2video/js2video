/** Radial Background Gradient */

const defaultParams = {
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
};

const template = async ({
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
  d3,
}) => {
  const color = d3.interpolateRgbBasis(["purple", "green", "orange"]);

  const gradient = new Fabric.Gradient({
    type: "radial",
    coords: {
      x1: params.size.width / 2,
      y1: params.size.height / 2,
      r1: 0,
      x2: params.size.width / 2,
      y2: params.size.height / 2,
      r2: Math.max(params.size.width, params.size.height),
    },
    colorStops: [
      { offset: 0, color: color(0) }, // purple
      { offset: 0.5, color: color(0.5) }, // green
      { offset: 1, color: color(1) }, // orange
    ],
  });

  canvas.set({ backgroundColor: gradient });

  timeline.to({}, { duration: 5 });
};

export { template, defaultParams };
