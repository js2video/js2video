/*
Transition: scale down in/out
*/

const defaultParams = {
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
  canvas.set({ backgroundColor: "#f3f8fb" });

  const obj = new Fabric.Rect({
    width: 200,
    height: 200,
    scaleX: 2,
    scaleY: 2,
    fill: "#ff1d63",
    originX: "center",
    originY: "center",
  });

  // add object to canvas
  canvas.add(obj);
  canvas.centerObject(obj);

  // scale down in/out
  timeline.scaleDownIn(obj).scaleDownOut(obj, { delay: 1 });
};

export { template, defaultParams };
