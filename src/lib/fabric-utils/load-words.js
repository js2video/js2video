import { Textbox, Group, FabricText } from "fabric";

async function loadWords({ canvas, text, options = {} }) {
  const obj = new Group();
  const t = new Textbox(text, options);
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
        const wordText = new FabricText(word, {
          ...style,
          left: boxLeft + lineLeft + wordLeft,
          top: lineHeight * i,
        });
        canvas.add(wordText);
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
