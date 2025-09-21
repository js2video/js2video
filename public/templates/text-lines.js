/*
Animate text as separate words
*/

const defaultParams = {
  text: "I love deadlines. I like the whooshing sound they make as they fly by.",
  fontFamily: "Rubik",
  fps: 30,
  size: {
    width: 1080,
    height: 1920,
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
  canvas.set({ backgroundColor: "gray" });

  // load Google font by name
  await utils.loadGoogleFont(params.fontFamily);

  // load text object
  const text = await canvasUtils.loadLines({
    canvas,
    text: params.text,
    options: {
      width: canvas.width * 0.8,
      fontSize: 160,
      fontWeight: "bold",
      fontFamily: params.fontFamily,
      fill: "white",
      textAlign: "center",
      textBackgroundColor: "#000",
      textBackgroundPaddingX: 40,
    },
  });

  // center text on canvas
  canvas.centerObject(text);

  // animate chars
  timeline
    .from(text._objects, {
      top: "-=200",
      opacity: 0,
      duration: 0.3,
      ease: "elastic",
      duration: 2,
      stagger: {
        each: 0.02,
        from: "start",
      },
    })
    .to(text._objects, {
      delay: 10,
      top: "+=200",
      opacity: 0,
      duration: 0.5,
      stagger: {
        each: 0.02,
        from: "start",
      },
    });
};

export { template, defaultParams };
