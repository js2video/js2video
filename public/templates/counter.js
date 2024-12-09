/*
Animate a counter
*/

const defaultParams = {
  fontFamily: "Space Mono",
  from: "0",
  to: "53.9",
  prefix: "",
  postfix: "%",
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
};

const template = async ({ canvas, timeline, params, utils, canvasUtils }) => {
  canvas.set({ backgroundColor: "#ececec" });

  // create a formatter from the number
  const formatter = new Intl.NumberFormat("en-US", {
    minimumIntegerDigits: 2,
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  // load google font
  await utils.loadGoogleFont(params.fontFamily);

  // load text object
  const text = await canvasUtils.loadText({
    text: params.from,
    options: {
      fontSize: 300,
      fontFamily: params.fontFamily,
      fontWeight: "bold",
      fill: "#121212",
      originX: "center",
      originY: "center",
    },
  });

  // add text to canvas
  canvas.add(text);

  // center text on canvas
  canvas.centerObject(text);

  // animate counter
  timeline.fromTo(
    text,
    { text: params.from },
    {
      text: params.to,
      duration: 8,
      modifiers: {
        text: function (value, obj) {
          obj.set({
            text: params.prefix + formatter.format(value + "") + params.postfix,
          });
        },
      },
      ease: "expo.inOut",
    },
    0
  );

  // add some pause at the end
  timeline.to({}, { duration: 2 });
};

export { template, defaultParams };
