/*
Add tint with a ColorMatrixFilter filter
*/

const defaultParams = {
  videoUrl: "https://js2video.com/video/bbb.mp4",
  tintColor: "0xff0000",
  tintIntensity: 0.3,
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
  // load video from URL
  const video = await canvasUtils.loadVideo({
    url: params.videoUrl,
    options: {
      originX: "center",
      originY: "center",
    },
  });

  // add video to canvas
  canvas.add(video);
  // scale video to fit canvas
  canvasUtils.scaleToFitCanvas(video, canvas);
  // center video on canvas
  canvas.centerObject(video);

  // create tint filter
  const filters = [];
  const tintFilter = new Pixi.ColorMatrixFilter();
  tintFilter.tint(params.tintColor, params.tintIntensity); // Add color with 30% intensity
  filters.push(tintFilter);

  const pixiFilters = await canvasUtils.loadPixiFilters({ canvas, filters });
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
