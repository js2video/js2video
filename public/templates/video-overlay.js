/*
Background video with text overlay
*/

const defaultParams = {
  text: "Don't panic!",
  videoUrl: "/video/bbb.mp4",
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
};

const template = async ({ canvas, timeline, params, utils, canvasUtils }) => {
  // set background color
  canvas.set({ backgroundColor: "green" });

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

  // load text object
  const text = await canvasUtils.loadText({
    text: params.text,
    options: {
      fontSize: 200,
      fontFamily: "sans-serif",
      fill: "white",
    },
  });

  // add text to canvas
  canvas.add(text);

  // center text on canvas
  canvas.centerObject(text);

  // create a no-op animation with the duration of the video
  timeline.from(
    video,
    {
      scaleX: 0.1,
      scaleY: 0.2,
      opacity: 0,
      duration: 1.2,
      ease: "elastic",
    },
    0
  );

  // create a no-op animation with the duration of the video
  timeline.to(
    {},
    {
      duration: video.js2video_video.duration,
    },
    0
  );
};

export { template, defaultParams };
