/*
Text with glitch + blur filter
https://pixijs.io/filters/docs/GlitchFilter.html
https://pixijs.io/filters/docs/KawaseBlurFilter.html
*/

const defaultParams = {
  text: "SAN DIEGO 1992",
  fontFamily: "Liter", // Google Font
  fps: 30,
  size: {
    width: 1280,
    height: 960,
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
  // generates a random number within a specified range, ensuring
  // the change from the current value does not exceed maxChange.
  function random2(current, min, max, maxChange) {
    const lowerBound = Math.max(min, current - maxChange);
    const upperBound = Math.min(max, current + maxChange);
    return Math.random() * (upperBound - lowerBound) + lowerBound;
  }

  // create a random number
  const random = (from, to) => utils.lerp(from, to, Math.random());

  // set background color
  canvas.set({ backgroundColor: "#000088" });

  // load Google font by name
  await utils.loadGoogleFont(params.fontFamily);

  // load text object
  const text = await canvasUtils.loadTextbox({
    text: params.text,
    options: {
      width: params.size.width * 0.5,
      fontSize: 60,
      fontFamily: params.fontFamily,
      fontWeight: "bold",
      fill: "#ffffff",
      textAlign: "center",
    },
  });

  // add text to canvas, scale and center
  canvas.add(text);
  canvasUtils.scaleToFitCanvas(text, canvas, 0.9);
  canvas.centerObject(text);

  const filters = [];

  const glitchFilter = new PixiFilters.GlitchFilter({
    slices: 20,
    offset: 10,
    green: { x: 10, y: 10 },
  });
  filters.push(glitchFilter);

  const blurFilter = new PixiFilters.KawaseBlurFilter();
  filters.push(blurFilter);

  const pixiFilters = await canvasUtils.loadPixiFilters({ canvas, filters });
  canvas.add(pixiFilters);

  pixiFilters.set({
    left: params.size.width * 0.5,
    top: 0,
    scaleX: 1.3,
    scaleY: 1.1,
    originX: "center",
  });

  // animate filter properties
  timeline.to(
    {},
    {
      duration: 5,
      // animate the glitch filter properties
      onUpdate: () => {
        filters.map((f) => {
          f.slices = parseInt(random(18, 22));
          f.offset = random2(f.offset, -10, 10, 2);
          f.strength = random2(f.strength, 0, 1, 0.1);
          f.green = { x: random(0, 12), y: 0 };
        });
      },
    },
    0
  );
};

export { template, defaultParams };
