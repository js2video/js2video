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
  matrix: [
    1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0,
    11.793603434377337, -0.3087833385928097, 1.7658908555458428,
    -0.10601743074722245, 0, -70.35205161461398, -0.231103377548616,
    -0.7501899197440212, 1.847597816108189, 0, 30.950940869491138, 0, 0, 0, 1,
    0,
  ],
};

const template = async ({
  canvas,
  Pixi,
  timeline,
  params,
  utils,
  canvasUtils,
  PixiFilters,
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

  const colorMatrixFilter = new Pixi.ColorMatrixFilter();

  // color matrix for TechniColor
  // you can ask a LLM to create these for you!
  colorMatrixFilter._loadMatrix(params.matrix, true);

  filters.push(colorMatrixFilter);

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
