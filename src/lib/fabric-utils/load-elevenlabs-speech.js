import { formatElevenLabsTimestamps } from "../format-elevenlabs-timestamps";
import { loadAudio } from "./load-audio";

const loadElevenLabsSpeech = async ({
  timeline,
  canvas,
  dataUrl,
  minDuration = 0.4,
  offset = 0,
  animateFrom = { opacity: 0, scaleX: 0.6, scaleY: 0.6 },
  animateTo = { duration: 0.2, opacity: 1, scaleX: 1, scaleY: 1, ease: "back" },
  textObject,
  modifyText = (text) => text,
}) => {
  const speech = await fetch(dataUrl).then((r) => r.json());
  const audioUrl = `data:audio/mpeg;base64,${speech.audio_base64}`;
  const audio = await loadAudio({
    url: audioUrl,
    video: null,
    options: { offset },
  });

  canvas.add(audio);

  const subtitles = formatElevenLabsTimestamps({
    input: speech.normalized_alignment,
    minDuration,
  });

  subtitles.map((item, i) => {
    const [start, text] = item;
    timeline.fromTo(
      textObject,
      { ...animateFrom },
      {
        ...animateTo,
        onStart: () => {
          textObject.set({
            text: modifyText(text),
          });
        },
      },
      start + offset
    );
  });
};

export { loadElevenLabsSpeech };
