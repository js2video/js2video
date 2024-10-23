import { createFile, DataStream } from "mp4box";

async function demux({ url }) {
  let file;
  let track;
  let _info;
  let _samples = [];
  let codecConfig;

  await new Promise((resolve) => {
    file = createFile();

    file.onReady = (info) => {
      _info = info;
      track = info.tracks.find((item) => item.type === "video");
      codecConfig = getCodecConfig(track, file);
      file.setExtractionOptions(track.id, null, {
        nbSamples: 1000,
      });
      file.start();
      file.flush();
    };

    file.onSamples = (id, user, samples) => {
      _samples.push(...samples);
      if (_samples.length >= track.nb_samples) {
        resolve();
      }
    };

    const fileSink = new MP4File(file);
    fetch(url).then((response) =>
      response.body.pipeTo(new WritableStream(fileSink, { highWaterMark: 2 }))
    );
  });

  return { file, info: _info, track, samples: _samples, codecConfig };
}

function getCodecConfig(track, file) {
  return {
    codec: track.codec,
    displayWidth: track.video.width,
    displayHeight: track.video.height,
    description: description(track, file),
    optimizeForLatency: true,
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

class MP4File {
  constructor(file) {
    this.file = file;
    this.offset = 0;
  }

  write(chunk) {
    const buffer = new ArrayBuffer(chunk.byteLength);
    new Uint8Array(buffer).set(new Uint8Array(chunk));
    // @ts-ignore
    buffer.fileStart = this.offset;
    this.offset += buffer.byteLength;
    this.file.appendBuffer(buffer);
  }

  close() {
    this.file.flush();
  }
}

export { demux };
