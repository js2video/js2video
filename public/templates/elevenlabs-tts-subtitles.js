const defaultParams = {
  elevenLabsDataUrl: "https://js2video.com/elevenlabs/speech-1.json",
  imageUrl: "https://js2video.com/images/ai/axolotl.jpeg",
  fontFamily: "Baloo",
  fps: 30,
  size: {
    width: 1080,
    height: 1920,
  },
};

const template = async ({
  gsap,
  timeline,
  canvas,
  canvasElement,
  params,
  Fabric,
  Pixi,
  PixiFilters,
  utils,
  canvasUtils,
}) => {
  // load image from URL
  const image = await canvasUtils.loadImage({
    url: params.imageUrl,
    options: {
      originX: "center",
      originY: "center",
    },
  });

  // add, scale and center image
  canvas.add(image);
  canvasUtils.scaleToCoverCanvas(image, canvas);
  canvas.centerObject(image);

  // load gogle font by name
  await utils.loadGoogleFont(params.fontFamily);

  // create text for subtitles
  const textObject = await canvasUtils.loadTextbox({
    text: "",
    options: {
      width: params.size.width * 0.8,
      fontFamily: params.fontFamily,
      fontSize: 120,
      originX: "center",
      originY: "center",
      left: params.size.width * 0.5,
      top: params.size.height * 0.8,
      textAlign: "center",
      fontWeight: "bold",
      stroke: "black",
      fill: "#ddff00",
      strokeWidth: 8,
      paintFirst: "stroke",
    },
  });

  // add text obj to canvas
  canvas.add(textObject);

  // load audio and subtitles
  await canvasUtils.loadElevenLabsSpeech({
    timeline,
    canvas,
    dataUrl: params.elevenLabsDataUrl,
    textObject,
    modifyText: (text) => text.toUpperCase(),
    offset: 0.5,
    minDuration: 0.4,
    animateFrom: { opacity: 0, scaleX: 0.6, scaleY: 0.6 },
    animateTo: {
      duration: 0.2,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      ease: "back",
    },
  });

  // add some pause at the end
  timeline.to({}, { duration: 1 });

  // scale up image
  timeline.to(
    image,
    {
      scaleX: image.scaleX * 1.2,
      scaleY: image.scaleY * 1.2,
      duration: timeline.duration(),
      ease: "linear",
    },
    0
  );
};

export { template, defaultParams };
