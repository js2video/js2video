/* 
Animated confetti from SVG
*/

const defaultParams = {
  text: "You Made It!",
  fontFamily: "Bangers",
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
  // set bg color
  canvas.set({ backgroundColor: "#111111" });

  // load Google font by name
  await utils.loadGoogleFont(params.fontFamily);

  // load text object
  const text = await canvasUtils.loadTextbox({
    text: params.text,
    options: {
      width: params.size.width * 0.8,
      fontSize: 180,
      fontFamily: params.fontFamily,
      fill: "#ffffff",
      textAlign: "center",
    },
  });

  text.set({ originX: "center", originY: "center" });

  // add + center text
  canvas.add(text);
  canvas.centerObject(text);

  // animate text
  timeline.from(text, {
    opacity: 0,
    scaleX: 0.01,
    scaleY: 0.1,
    duration: 0.8,
    ease: "elastic",
  });

  // load svg from url
  const svg = await canvasUtils.loadSvg({ url: "/svg/confetti.svg" });

  // scale + center svg
  canvasUtils.scaleToCoverCanvas(svg, canvas, 1.1);
  canvas.centerObject(svg);

  // get confetti "strings"
  const confettis = svg.getObjects();

  // animate them
  confettis.map((confetti) => {
    const length = utils.lerp(
      100,
      Math.max(params.size.width, params.size.height),
      Math.random()
    );
    const pathLength = canvasUtils.getSvgPathLength(confetti.path);
    canvas.add(confetti);
    confetti.set({
      objectCaching: false,
    });
    timeline.fromTo(
      confetti,
      {
        stroke: utils.randomColor(),
        strokeDashArray: [length, pathLength],
        strokeWidth: utils.lerp(3, 60, Math.random()),
        strokeDashOffset: pathLength + length * 2,
      },
      {
        strokeDashOffset: length,
        delay: utils.lerp(0, 0.4, Math.random()),
        duration: utils.lerp(1, 3, Math.random()),
        ease: "power4.out",
        repeat: 1,
        repeatDelay: 0.5,
      },
      0
    );
  });
};

export { template, defaultParams };
