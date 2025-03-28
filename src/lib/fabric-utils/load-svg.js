import { loadSVGFromString, util as canvasUtils } from "fabric";

const loadSvg = async ({ url, options }) => {
  const svgString = await fetch(url).then((res) => res.text());
  const obj = await loadSvgFromString({ string: svgString, options });
  return obj;
};

const loadSvgFromString = async ({ string, options }) => {
  const { objects } = await loadSVGFromString(string);
  const obj = canvasUtils.groupSVGElements(objects);
  obj.set(options);
  return obj;
};

export { loadSvg, loadSvgFromString };
