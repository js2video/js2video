import { djb2Hash } from "../lib/utils";

function getFont(family) {
  for (const fontFace of document.fonts) {
    if (fontFace.family === family) {
      return fontFace;
    }
  }
  return null;
}

const loadFont = async (url) => {
  const family = "font-" + djb2Hash(url);
  let font = getFont(family);
  if (!font) {
    font = new FontFace(family, `url(${url})`);
    document.fonts.add(font);
  }
  if (document.fonts.check(`16px ${family}`)) {
    console.log(`font already loaded: ${url}`);
    return family;
  }
  try {
    console.log("load font", url);
    await font.load();
    console.log(`loaded font ${url}`);
    return family;
  } catch (e) {
    throw new Error(`Could not load font: ${url}`);
  }
};

export { loadFont };
