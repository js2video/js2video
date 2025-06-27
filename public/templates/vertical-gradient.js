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
}) => {
  const gradient = new Fabric.Gradient({
    type: "linear",
    coords: { x1: 0, y1: 0, x2: 0, y2: params.size.height },
    colorStops: [
      { offset: 0, color: "#ff69b4" }, // hot pink
      { offset: 1, color: "#39ff14" }, // neon green
    ],
  });

  canvas.set({ backgroundColor: gradient });

  timeline.to({}, { duration: 5 });
};

export { template, defaultParams };
