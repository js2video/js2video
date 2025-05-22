let ac = null;

function getAudioContext() {
  if (!ac) {
    ac = new AudioContext({ sampleRate: 44100 });
  }
  return ac;
}

export { getAudioContext };
