/*
Write a text in a typewriter style
*/

const defaultParams = {
  text: "Are we human?",
  fontFamily: "Space Grotesk",
  cursor: "▎",
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
};

const template = async ({ canvas, timeline, params, utils, canvasUtils }) => {
  // set background color
  canvas.set({ backgroundColor: "#fefb9f" });

  // load google font
  await utils.loadGoogleFont(params.fontFamily);

  // load text object
  const text = await canvasUtils.loadTextbox({
    text: "",
    options: {
      width: params.size.width * 0.8,
      fontSize: 140,
      fontFamily: params.fontFamily,
      fontWeight: "bold",
      fill: "#000000",
      originX: "center",
      originY: "center",
      textAlign: "center",
    },
  });

  // add text to canvas
  canvas.add(text);

  // center text on canvas
  canvas.centerObject(text);

  // split text into chars
  const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
  const chars = [...seg.segment(params.text)].map((s) => s.segment);

  // animate chars
  timeline.to(
    text,
    {
      text: "",
      duration: chars.length * 0.1,
      modifiers: {
        text: function (value, obj) {
          const charsToShow = Math.floor(
            utils.lerp(0, chars.length, this.progress())
          );
          obj.set({
            text: !charsToShow
              ? ""
              : chars.slice(0, charsToShow).join("") + params.cursor,
          });
        },
      },
    },
    0
  );

  // add some pause at the end
  timeline.to({}, { duration: 3 });
};

export { template, defaultParams };
