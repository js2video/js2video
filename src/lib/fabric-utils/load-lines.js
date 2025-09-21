import { Group } from "fabric";
import { loadTextbox } from "./load-textbox";
import { loadText } from "./load-text";

async function loadLines({ canvas, text, options = {} }) {
  const obj = new Group();
  const t = await loadTextbox({ text, options });
  const boxLeft = t._getLeftOffset();
  for (let i = 0; i < t._textLines.length; i++) {
    const lineText = t._textLines[i].join(""); // fix here
    const lineLeft = t._getLineLeftOffset(i);
    const lineHeight = t.getHeightOfLine(i);
    const style = t.getCompleteStyleDeclaration(i, 0);
    const lineObj = await loadText({
      text: lineText,
      options: {
        ...options,
        ...style,
        left: boxLeft + lineLeft,
        top: lineHeight * i,
      },
    });
    canvas.add(lineObj);
    // @ts-ignore
    obj.add(lineObj);
  }
  canvas.remove(t);
  return obj;
}

export { loadLines };
