/*
Background video with a custom colorMatrix filter
https://pixijs.download/dev/docs/filters.ColorMatrixFilter.html
*/

const defaultParams = {
  videoUrl: "https://js2video.com/video/bbb.mp4",
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
  filter: {
    alpha: 1,
    blue: 1,
    brightness: 1,
    contrast: 3,
    gamma: 1,
    green: 1,
    red: 1,
    saturation: 0,
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
  // load video from URL
  const video = await canvasUtils.loadVideo({
    url: params.videoUrl,
    options: {
      originX: "center",
      originY: "center",
    },
  });

  canvas.add(video);
  canvasUtils.scaleToCoverCanvas(video, canvas);
  canvas.centerObject(video);

  const filters = [];

  // https://pixijs.io/filters/docs/AdjustmentFilter.html
  const adjustmentFilter = new PixiFilters.AdjustmentFilter(params.filter);
  filters.push(adjustmentFilter);

  const pixiFilters = await canvasUtils.loadPixiFilters({
    canvas,
    filters,
  });

  const mask = new Fabric.Circle({
    originX: "center",
    originY: "center",
    left: params.size.width * 0.5,
    top: params.size.height * 0.5,
    radius: Math.min(params.size.height, params.size.width) * 0.5 * 0.8,
    absolutePositioned: true,
  });

  // add filter mask
  pixiFilters.set({
    clipPath: mask,
  });

  canvas.add(pixiFilters);

  // animate the mask
  timeline.fromTo(
    mask,
    { left: 0 },
    {
      left: params.size.width,
      duration: video.js2video_duration,
    },
    0
  );
};

export { template, defaultParams };
