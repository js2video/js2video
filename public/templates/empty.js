/*
Empty starter template
*/

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
  // set background color
  canvas.set({ backgroundColor: "#e9e9e9" });

  // dummy animation
  timeline.to(
    {},
    {
      duration: 5,
    }
  );
};

export { template, defaultParams };
