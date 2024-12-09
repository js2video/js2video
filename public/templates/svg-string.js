/*
Load SVG from string
*/

const defaultParams = {
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
};

const template = async ({ canvas, timeline, params, utils, canvasUtils }) => {
  // set background color
  canvas.set({ backgroundColor: "#000088" });

  // load SVG from string
  const svg = await canvasUtils.loadSvgFromString({
    string: `
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="yellow" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>`,
    options: {
      originX: "center",
      originY: "center",
    },
  });

  // add/scale/center SVG
  canvas.add(svg);
  canvasUtils.scaleToFitCanvas(svg, canvas);
  canvas.centerObject(svg);

  // animate SVG
  timeline.to(svg, { angle: 360, duration: 6 });
};

export { template, defaultParams };
