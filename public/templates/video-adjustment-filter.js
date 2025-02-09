/*
Background video with an adjustment filter
https://pixijs.io/filters/docs/AdjustmentFilter.html
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
    blue: 1.05,
    brightness: 1.2,
    contrast: 0.85,
    gamma: 1.1,
    green: 1.05,
    red: 1.15,
    saturation: 3.1,
  },
};

const template = async ({
  canvas,
  Pixi,
  timeline,
  params,
  utils,
  canvasUtils,
  PixiFilters,
  Fabric,
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

  canvas.add(pixiFilters);

  // create a no-op animation with the duration of the video
  timeline.to(
    {},
    {
      duration: video.js2video_duration,
    },
    0
  );
};

export { template, defaultParams };
