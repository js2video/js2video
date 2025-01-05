/*
Background video with text overlay
*/

const defaultParams = {
  text: "Don't panic!",
  videoUrl: "https://js2video.com/video/bbb.mp4",
  fps: 15,
  size: {
    width: 1080,
    height: 1080,
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
}) => {
  // load video from URL
  const video = await canvasUtils.loadVideo({
    url: params.videoUrl,
    options: {
      originX: "center",
      originY: "center",
      flipX: true,
      flipY: true,
    },
  });

  canvas.add(video);
  canvasUtils.scaleToCoverCanvas(video, canvas);
  canvas.centerObject(video);

  const oldFilmFilter = new PixiFilters.OldFilmFilter({
    sepia: 1,
    noise: 0.1,
    noiseSize: 2,
    seed: Math.random(),
    scratchWidth: 8,
    vignettingAlpha: 0.2,
  });
  const filters = [oldFilmFilter];
  const pixiFilters = await canvasUtils.loadPixiFilters({ canvas, filters });
  canvas.add(pixiFilters);

  // create a no-op animation with the duration of the video
  timeline.to(
    {},
    {
      duration: video.js2video_video.duration,
      onUpdate: () => {
        filters.map((f) => (f.seed = Math.random()));
      },
    },
    0
  );
};

export { template, defaultParams };
