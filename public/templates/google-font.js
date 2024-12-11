/*
Load Google font by name
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
  // set background color
  canvas.set({ backgroundColor: "#a284fa" });

  // load Google font by name
  await utils.loadGoogleFont(params.fontFamily);

  // load text object
  const text = await canvasUtils.loadTextbox({
    text: params.text,
    options: {
      width: 1200,
      fontSize: 120,
      fontFamily: params.fontFamily,
      fill: "#ffffff",
      textAlign: "center",
    },
  });

  // add text to canvas
  canvas.add(text);

  // center text on canvas
  canvas.centerObject(text);

  // animate text in - out
  timeline
    .from(text, {
      opacity: 0,
      duration: 1,
    })
    .to(text, {
      opacity: 0,
      duration: 1,
      delay: 2,
    });
};

export { template, defaultParams };
