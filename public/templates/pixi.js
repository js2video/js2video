/*
Load Pixi
*/

const defaultParams = {
  fontFamily: "Bangers",
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
  d3,
}) => {
  // canvas.set({ backgroundColor: "#e9e9e9" });
  // const pixi = await canvasUtils.loadPixi({ canvas });
  // pixi.set({ backgroundColor: "red" });
  // canvas.add(pixi);
  // const text = new Pixi.HTMLText({
  //   text: "<h1>Pixi Text</h1>",
  //   style: {
  //     fontSize: 120,
  //     fontWeight: 650,
  //     fill: "black",
  //   },
  // });
  // pixi.js2video_app.stage.addChild(text);
  // timeline.to({}, { duration: 2 }, 0);
};

export { template, defaultParams };
