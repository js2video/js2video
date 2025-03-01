/*
Text with glitch + blur filter
https://pixijs.io/filters/docs/GlitchFilter.html
https://pixijs.io/filters/docs/KawaseBlurFilter.html
*/

const defaultParams = {
  text: "SAN DIEGO 1992",
  fontFamily: "Liter", // Google Font
  imageUrl: "https://js2video.com/images/ai/beach.jpg", // AI-generated
  fps: 30,
  size: {
    width: 1280,
    height: 960,
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

  // load image from URL
  const image = await canvasUtils.loadImage({
    url: params.imageUrl,
    options: {
      originX: "center",
      originY: "center",
      opacity: 0.4,
    },
  });

  // add image to canvas
  canvas.add(image);

  // scale video to cover canvas
  canvasUtils.scaleToCoverCanvas(image, canvas);

  // center video on canvas
  canvas.centerObject(image);

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
    scaleX: 1.1,
    scaleY: 1.1,
    originX: "center",
  });

  // scale up image a bit
  timeline.to(
    image,
    {
      scaleX: image.scaleX * 1.2,
      scaleY: image.scaleY * 1.2,
      duration: 5,
      ease: "linear",
    },
    0
  );

  // animate filter properties
  timeline.to(
    {},
    {
      duration: 5,
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
