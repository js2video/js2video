/*
Animate text as separate characters
*/

const defaultParams = {
  text: "The ships hung in the sky in much the same way that bricks don't.",
  fontFamily: "Krona One",
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
};

const template = async ({ canvas, timeline, params, utils, canvasUtils }) => {
  canvas.set({ backgroundColor: "#002299" });

  // load Google font by name
  await utils.loadGoogleFont(params.fontFamily);

  // load text object
  const text = await canvasUtils.loadChars({
    canvas,
    text: params.text,
    options: {
      width: 1200,
      fontSize: 120,
      fontFamily: params.fontFamily,
      fill: "white",
      textAlign: "center",
    },
  });

  // add text to canvas
  canvas.add(text);

  // center text on canvas
  canvas.centerObject(text);

  // animate chars
  timeline
    .from(text._objects, {
      left: "-=100",
      opacity: 0,
      duration: 0.2,
      stagger: 0.02,
      ease: "back",
    })
    .to({}, { duration: 1 });
};

export { template, defaultParams };
