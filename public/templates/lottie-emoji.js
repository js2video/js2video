/*
Load Lottie animation from URL
*/

const defaultParams = {
  lottieUrl: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f92f/lottie.json",
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
  // set canvas background color
  canvas.set({ backgroundColor: "papayawhip" });

  // load lottie animation from URL
  const lottie = await canvasUtils.loadLottie({
    url: params.lottieUrl,
    options: {
      width: params.size.width / 2,
      height: params.size.height / 2,
    },
  });

  // add/center lottie animation on canvas
  canvas.add(lottie);
  canvas.centerObject(lottie);

  // create a dummy animation as long as the lottie animation
  timeline.to({}, { duration: lottie.js2video_lottie.duration });
};

export { template, defaultParams };
