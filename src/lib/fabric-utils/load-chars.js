import { Group } from "fabric";
import { loadTextbox } from "./load-textbox";
import { loadText } from "./load-text";

async function loadChars({ canvas, text, options = {} }) {
  const obj = new Group();
  const t = await loadTextbox({ text, options });
  const boxLeft = t._getLeftOffset();
  for (let i = 0; i < t._textLines.length; i++) {
    const lineHeight = t.getHeightOfLine(i);
    const lineLeft = t._getLineLeftOffset(i);
    const textLine = t._textLines[i];
    for (let j = 0; j < textLine.length; j++) {
      const style = t.getCompleteStyleDeclaration(i, j);
      const { left: charLeft } = t.__charBounds[i][j];
      const char = textLine[j];
      const charText = await loadText({
        text: char,
        options: {
          ...options,
          ...style,
          left: boxLeft + lineLeft + charLeft,
          top: lineHeight * i,
        },
      });
      canvas.add(charText);
      // @ts-ignore
      obj.add(charText);
    }
  }
  canvas.remove(t);
  return obj;
}

export { loadChars };
