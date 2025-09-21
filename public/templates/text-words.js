/*
Animate text as separate words
*/

const defaultParams = {
  text: "I love deadlines. I like the whooshing sound they make as they fly by.",
  fontFamily: "Gloock",
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
  canvas.set({ backgroundColor: "purple" });

  // load Google font by name
  await utils.loadGoogleFont(params.fontFamily);

  // load text object
  const text = await canvasUtils.loadWords({
    canvas,
    text: params.text,
    options: {
      width: canvas.width * 0.8,
      fontSize: 130,
      fontWeight: "bold",
      fontFamily: params.fontFamily,
      fill: "yellow",
      textAlign: "center",
    },
  });

  // center text on canvas
  canvas.centerObject(text);

  // animate chars
  timeline
    .from(text._objects, {
      left: "-=200",
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
      delay: 2,
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
