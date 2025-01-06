/*
Background video with text overlay
*/

const defaultParams = {
  videoUrl: "https://js2video.com/video/bbb.mp4",
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
};

const template = async ({
  canvas,
  timeline,
  params,
  utils,
  canvasUtils,
  PixiFilters,
}) => {
  // set background color
  canvas.set({ backgroundColor: "green" });

  // load video from URL
  const video = await canvasUtils.loadVideo({
    url: params.videoUrl,
    start: 10,
    end: 15,
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

  const audio = await canvasUtils.loadAudio({ video });
  canvas.add(audio);

  console.log(audio.js2video_duration);

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
