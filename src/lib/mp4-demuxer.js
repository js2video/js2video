import { createFile, DataStream } from "mp4box";

async function demux({ url }) {
  // load the whole url into a buffer
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = arrayBuffer;
  // @ts-ignore
  buffer.fileStart = 0;

  const { file, id, codecConfig, samples } = await new Promise((resolve) => {
    let track, codecConfig, fileInfo;
    const file = createFile();
    file.onReady = (info) => {
      console.log("onready");
      fileInfo = info;
      track = info.tracks.find((item) => item.type === "video");
      codecConfig = getCodecConfig(track, file);
      file.setExtractionOptions(track.id, null, {
        nbSamples: Infinity,
      });
    };
    file.onSamples = (id, user, samples) => {
      console.log("onsamples", samples.length);
      resolve({ file, id, samples, codecConfig });
    };
    console.log("append buffer");
    file.appendBuffer(buffer);
    file.start();
    file.flush();
  });

  return { file, id, samples, codecConfig };
}

function getCodecConfig(track, file) {
  return {
    codec: track.codec,
    displayWidth: track.video.width,
    displayHeight: track.video.height,
    description: description(track, file),
    optimizeForLatency: true,
    hardwareAcceleration: "prefer-hardware",
  };
}

function description(track, file) {
  const trackInfo = file.getTrackById(track.id);
  for (const entry of trackInfo.mdia.minf.stbl.stsd.entries) {
    if (entry.avcC || entry.hvcC) {
      const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
      (entry.avcC || entry.hvcC).write(stream);
      return new Uint8Array(stream.buffer, 8);
    }
  }
}

export { demux };
