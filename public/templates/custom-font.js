/*
Load custom font by URL
*/

const defaultParams = {
  text: "Don't panic!",
  fontUrl: "https://js2video.com/fonts/calsans-semibold.woff2",
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
};

const template = async ({ canvas, timeline, params, utils, canvasUtils }) => {
  // set background color
  canvas.set({ backgroundColor: "#1f7dff" });

  // load font from URL
  const fontFamily = await utils.loadFont(params.fontUrl);

  // load text object
  const text = await canvasUtils.loadText({
    text: params.text,
    options: {
      fontSize: 200,
      fontFamily: fontFamily,
      fill: "#000000",
      originX: "center",
      originY: "center",
    },
  });

  // add text to canvas
  canvas.add(text);

  // center text on canvas
  canvas.centerObject(text);

  // animate text in - out
  timeline
    .from(text, {
      scaleX: 0,
      scaleY: 0,
      duration: 0.5,
      delay: 0.2,
      ease: "elastic",
    })
    .to(text, {
      opacity: 0,
      duration: 2,
      delay: 1,
      ease: "expo.out",
    });
};

export { template, defaultParams };
