/*
Transition: slide left in/out
*/

const defaultParams = {
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
};

const template = async ({ canvas, timeline, Fabric }) => {
  canvas.set({ backgroundColor: "#f3f8fb" });

  const obj = new Fabric.Rect({
    width: 200,
    height: 200,
    scaleX: 2,
    scaleY: 2,
    fill: "#ff1d63",
  });

  // add object to canvas
  canvas.add(obj);
  canvas.centerObject(obj);

  // slide left in/out
  timeline.slideLeftIn(obj).slideLeftOut(obj, { delay: 1 });
};

export { template, defaultParams };
