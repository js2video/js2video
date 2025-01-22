import { util } from "fabric";

const getSvgPathLength = (path) => {
  const pathInfo = util.getPathSegmentsInfo(path);
  return pathInfo[pathInfo.length - 1].length;
};

export { getSvgPathLength };
