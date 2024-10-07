const defaultParams = {
  text: "No Text",
  fontFamily: "Oswald",
};

const template = async ({
  canvas,
  timeline,
  params,
  size,
  Fabric,
  Pixi,
  PixiFilters,
  utils,
  fabricUtils,
}) => {
  canvas.set({ backgroundColor: "#ff0000" });

  await utils.loadGoogleFont(params.fontFamily);

  const text = new Fabric.FabricText(params.text, {
    fontSize: 222,
    fontFamily: params.fontFamily,
    fill: "yellow",
    originX: "center",
    originY: "center",
  });

  canvas.add(text);
  canvas.centerObject(text);

  timeline.from(text, {
    opacity: 0,
    duration: 1,
    ease: "expo.inOut",
  });

  timeline.to(text, {
    opacity: 0,
    duration: 1,
    delay: 1,
    ease: "expo.out",
  });
};

export { template, defaultParams };
