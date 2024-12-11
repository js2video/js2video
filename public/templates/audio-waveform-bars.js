/*
Load audio from URL and display waveform bars
*/

const defaultParams = {
  audioUrl: "https://js2video.com/audio/audio.mp3",
  fps: 30,
  size: {
    width: 1920,
    height: 1080,
  },
};

const template = async ({ canvas, timeline, params, utils, canvasUtils }) => {
  // set background color
  canvas.set({ backgroundColor: "#ff0200" });

  // load audio from URL
  const audio = await canvasUtils.loadAudio({ url: params.audioUrl });

  // add audio to canvas
  canvas.add(audio);

  // analyze audio waveform
  const analyzedAudio = await utils.analyzeAudio({
    url: params.audioUrl,
    audioBuffer: audio.js2video_audioBuffer,
    fps: params.fps,
    fftSize: 16384,
    minDb: -90,
    maxDb: -10,
    audioSmoothing: 0.2,
    minFreq: 40,
    maxFreq: 300,
    numberOfBins: 32,
  });

  // display waveform bars
  const waveform = await canvasUtils.loadWaveformBars({
    audio: analyzedAudio,
    paddingInner: 0.2,
    paddingOuter: 0,
    orientation: "vertical",
    anchor: "center",
    roundedCaps: true,
    options: {
      fill: "#ffffff",
      width: params.size.width * 0.5,
      height: params.size.height * 0.9,
      originY: "center",
      originX: "center",
    },
    offset: audio.js2video_offset,
    duration: audio.js2video_duration,
  });
  canvas.add(waveform);

  // put bars in center
  canvas.centerObject(waveform);

  // create animation in the duration of the audio
  timeline.to(
    {},
    { duration: audio.js2video_offset + audio.js2video_duration },
    0
  );
};

export { template, defaultParams };
