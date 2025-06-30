/*
Background image with text overlay
*/

const defaultParams = {
  text: "Don't panic!",
  imageUrl: "https://js2video.com/images/ocean.jpg",
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
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
  d3,
}) => {
  // load image from URL
  const image = await canvasUtils.loadImage({
    url: params.imageUrl,
    options: {
      originX: "center",
      originY: "center",
    },
  });

  // add image to canvas
  canvas.add(image);

  // scale video to cover canvas
  canvasUtils.scaleToCoverCanvas(image, canvas);

  // center video on canvas
  canvas.centerObject(image);

  // load text object
  const text = await canvasUtils.loadText({
    text: params.text,
    options: {
      fontSize: 200,
      fontFamily: "sans-serif",
      fill: "white",
    },
  });

  // add text to canvas
  canvas.add(text);

  // center text on canvas
  canvas.centerObject(text);

  // scale up image a bit
  timeline.to(
    image,
    {
      scaleX: image.scaleX * 1.2,
      scaleY: image.scaleY * 1.2,
      duration: 5,
      ease: "linear",
    },
    0
  );

  // fade out text
  timeline.to(text, { opacity: 0, duration: 5 }, 0);
};

export { template, defaultParams };
