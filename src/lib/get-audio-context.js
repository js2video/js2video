let ac = null;

function getAudioContext() {
  if (!ac) {
    ac = new AudioContext();
  }
  return ac;
}

export { getAudioContext };
