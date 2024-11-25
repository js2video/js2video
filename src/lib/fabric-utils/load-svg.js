import { loadSVGFromString, util as fabricUtils } from "fabric";

const loadSvg = async ({ url, options }) => {
  const svgString = await fetch(url).then((res) => res.text());
  const { objects } = await loadSVGFromString(svgString);
  const obj = fabricUtils.groupSVGElements(objects);
  obj.set(options);
  return obj;
};

export { loadSvg };
