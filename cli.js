#!/usr/bin/env node

import { exportVideo } from "./dist/index.server.js";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";

const argv = yargs(hideBin(process.argv))
  .command(
    "export",
    "Export the video template to MP4 format",
    (yargs) => {
      return yargs
        .option("template-url", {
          description: "URL to the video template",
          alias: "t",
          type: "string",
          demandOption: true,
        })
        .option("width", {
          description: "Width of the exported video",
          alias: "x",
          type: "number",
          demandOption: false,
          default: 1920,
        })
        .option("height", {
          description: "Height of the exported video",
          alias: "y",
          type: "number",
          demandOption: false,
          default: 1080,
        })
        .option("fps", {
          description: "FPS",
          alias: "f",
          type: "number",
          demandOption: false,
          default: 30,
        })
        .option("bitrate", {
          description: "Bitrate of the exported video",
          alias: "b",
          type: "number",
          demandOption: false,
          default: 5000000,
        })
        .option("params", {
          description: "Videt template params",
          alias: "p",
          type: "string",
          demandOption: false,
          default: "{}",
        });
    },
    async (argv) => {
      await exportVideo({
        templateUrl: argv.templateUrl,
        params: argv.params,
        size: { width: argv.width, height: argv.height },
        fps: argv.fps,
        params: JSON.parse(argv.params),
        bitrate: argv.bitrate,
      });
    }
  )
  .help()
  .alias("help", "h")
  .strict().argv;
