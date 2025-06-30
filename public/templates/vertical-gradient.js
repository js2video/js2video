/** Vertical Background Gradient */

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
    type: "linear",
    coords: { x1: 0, y1: 0, x2: 0, y2: params.size.height },
    colorStops: [
      { offset: 0, color: color(0) },
      { offset: 0.5, color: color(0.5) },
      { offset: 1, color: color(1) },
    ],
  });

  canvas.set({ backgroundColor: gradient });

  timeline.to(
    {},
    {
      duration: 5,
    }
  );
};

export { template, defaultParams };
