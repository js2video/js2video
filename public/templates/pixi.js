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
  canvas,
  timeline,
  params,
  utils,
  PixiFilters,
  canvasUtils,
  Pixi,
}) => {
  const pixi = await canvasUtils.loadPixi({ canvas });
  canvas.add(pixi);

  const text = new Pixi.HTMLText({
    text: "This is a <h1 style='margin:0;padding:0;text-decoration:underline;font-family:inter'>HAHA</h1> <em style='color:red'>styled</em><br /> text! <a style='text-underline' href='http://vg.no'>a</a>",
    style: {
      fontSize: 120,
      fontWeight: 650,
      fill: "yellow",
    },
  });

  pixi.js2video_app.stage.addChild(text);

  // const filter = new PixiFilters.AsciiFilter({ size: 28 });
  // pixi.js2video_app.stage.filters = [filter];

  // create a dummy animation as long as the lottie animation
  timeline.to({}, { duration: 2 }, 0);
};

export { template, defaultParams };
