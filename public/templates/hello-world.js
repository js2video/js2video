const defaultParams = {
  name: "Unknown",
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
}) => {
  canvas.set({ backgroundColor: "#0000ee" });

  const text = await canvasUtils.loadText({
    text: `Hello ${params.name}!`,
    options: {
      fontSize: 200,
      fontFamily: "sans-serif",
      fill: "white",
      originX: "center",
      originY: "center",
    },
  });

  canvas.add(text);
  canvas.centerObject(text);

  timeline.from(text, {
    scaleX: 0,
    scaleY: 0,
    duration: 0.5,
    delay: 0.2,
    ease: "elastic",
  });

  timeline.to(text, {
    opacity: 0,
    duration: 2,
    delay: 1,
    ease: "expo.out",
  });
};

export { template, defaultParams };
