import { Group } from "fabric";
import { loadTextbox } from "./load-textbox";
import { loadText } from "./load-text";

async function loadWords({ canvas, text, options = {} }) {
  const obj = new Group();
  const t = await loadTextbox({ text, options });
  const boxLeft = t._getLeftOffset();

  for (let i = 0; i < t._textLines.length; i++) {
    const lineHeight = t.getHeightOfLine(i);
    const lineLeft = t._getLineLeftOffset(i);
    const textLine = t._textLines[i];
    let word = "";
    let wordLeft = null;

    for (let j = 0; j < textLine.length; j++) {
      const style = t.getCompleteStyleDeclaration(i, j);
      const { left: charLeft, width } = t.__charBounds[i][j];
      const char = textLine[j];

      if (word === "") {
        wordLeft = charLeft;
      }
      word += char;

      const isWordEnd = char === " " || j === textLine.length - 1;
      if (isWordEnd) {
        const wordText = await loadText({
          text: word,
          options: {
            ...options,
            ...style,
            left: boxLeft + lineLeft + wordLeft,
            top: lineHeight * i,
          },
        });
        canvas.add(wordText);
        // @ts-ignore
        obj.add(wordText);
        word = "";
        wordLeft = null;
      }
    }
  }

  canvas.remove(t);
  return obj;
}

export { loadWords };
