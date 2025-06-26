/*
Animate text as separate characters
*/

const defaultParams = {
  text: "The ships hung in the sky in much the same way that bricks don't.",
  fontFamily: "Liter",
  fps: 30,
  size: {
    width: 1080,
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
  canvas.set({ backgroundColor: "#000000" });

  // load Google font by name
  await utils.loadGoogleFont(params.fontFamily);

  // load text object
  const text = await canvasUtils.loadChars({
    canvas,
    text: params.text,
    options: {
      width: canvas.width * 0.8,
      fontSize: 120,
      fontWeight: "bold",
      fontFamily: params.fontFamily,
      fill: "white",
      textAlign: "center",
    },
  });

  // center text on canvas
  canvas.centerObject(text);

  // animate chars
  timeline
    .from(text._objects, {
      left: "-=100",
      top: 0,
      opacity: 0,
      duration: 0.1,
      stagger: 0.02,
      ease: "back",
      duration: 1,
    })
    .to(text._objects, {
      delay: 1,
      opacity: 0,
      duration: 0.5,
      stagger: {
        each: 0.02,
        from: "random",
      },
    });
};

export { template, defaultParams };
