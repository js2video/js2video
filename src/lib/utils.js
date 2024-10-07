// lerp(20, 80, 0.5) -> 40
const lerp = (x, y, a) => x * (1 - a) + y * a;

// clamp(32, 20, 30) -> 30
const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));

// invlerp(50, 100, 75) -> 0.5
const invlerp = (x, y, a) => clamp((a - x) / (y - x));

// range(10, 100, 2000, 20000, 50) -> 10000
const range = (x1, y1, x2, y2, a) => lerp(x2, y2, invlerp(x1, y1, a));

function scaleToFit(
  sourceWidth,
  sourceHeight,
  destWidth,
  destHeight,
  min = 0,
  max = Infinity
) {
  return clamp(
    Math.min(destWidth / sourceWidth, destHeight / sourceHeight),
    min,
    max
  );
}

function scaleToCover(sourceWidth, sourceHeight, destWidth, destHeight) {
  return Math.max(destWidth / sourceWidth, destHeight / sourceHeight);
}

async function loadGoogleFont(fontName) {
  try {
    await new Promise((resolve, reject) => {
      WebFont.load({
        google: {
          families: [fontName],
        },
        active: resolve,
        inactive: reject,
      });
    });
    return;
  } catch (e) {
    console.error("Could not load Google font: ", fontName);
    return;
  }
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const fractionalSeconds = Math.floor((seconds % 1) * 100);

  const paddedHours = hours.toString().padStart(2, "0");
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = remainingSeconds.toString().padStart(2, "0");
  const paddedFractionalSeconds = fractionalSeconds.toString().padStart(2, "0");

  if (hours === 0) {
    return `${paddedMinutes}:${paddedSeconds}.${paddedFractionalSeconds}`;
  }

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}.${paddedFractionalSeconds}`;
}

export {
  loadGoogleFont,
  lerp,
  clamp,
  invlerp,
  range,
  scaleToFit,
  scaleToCover,
  formatTime,
};
