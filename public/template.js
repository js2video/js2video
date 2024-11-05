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
  canvas.set({ backgroundColor: "#e9e9e9" });

  const video = await fabricUtils.loadVideo({
    url: "http://localhost:5173/Big_Buck_Bunny_1080_10s_1MB.mp4",
    options: {
      originX: "center",
      originY: "center",
    },
  });
  canvas.add(video);
  canvas.centerObject(video);

  await utils.loadGoogleFont(params.fontFamily);

  const text = new Fabric.FabricText(params.text, {
    fontSize: 150,
    fontFamily: params.fontFamily,
    fill: "yellow",
    originX: "center",
    originY: "center",
  });

  canvas.add(text);
  canvas.centerObject(text);

  timeline.from(video, {
    angle: 360,
    scaleX: 5,
    scaleY: 5,
    duration: 1,
    ease: "expo.inOut",
  });

  timeline.to(text, {
    opacity: 0,
    duration: 5,
    delay: 1,
    ease: "expo.out",
  });
};

export { template, defaultParams };
