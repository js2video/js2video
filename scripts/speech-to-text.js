import path from "path";
import * as fs from "fs/promises";
import os from "os";
import { nanoid } from "nanoid";

const voiceId = "abc123";

const json = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
  {
    method: "POST",
    headers: {
      "xi-api-key": "<API KEY>",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: "your text here",
      model: "eleven_turbo_v2",
    }),
  }
).then((r) => r.json());

// write to tempfile
const outputFile = path.join(os.tmpdir(), `elevenlabs-${nanoid()}.json`);

await fs.writeFile(outputFile, JSON.stringify(json, null, 2));

console.log(outputFile);
