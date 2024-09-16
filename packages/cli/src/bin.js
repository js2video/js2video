#!/usr/bin/env node

import { Command } from "commander";
import { exportVideo } from "@js2video/server";

const program = new Command();

program
  .version("1.0.0")
  .requiredOption("-t, --templateUrl <url>", "Template URL")
  .option("-p, --params <json>", "Parameters as JSON string", "{}")
  .option("-w, --width <width>", "Video width", "1080")
  .option("-h, --height <height>", "Video height", "1920")
  .option("-f, --fps <fps>", "Frames per second", "30")
  .option("-b, --bitrate <bitrate>", "Bitrate in bits per second", "5000000");

program.parse(process.argv);

const options = program.opts();

try {
  // Parse params safely
  const params = JSON.parse(options.params || "{}");

  // Convert fps and bitrate to numbers
  const fps = parseInt(options.fps, 10);
  const bitrate = parseInt(options.bitrate, 10);
  const width = parseInt(options.width, 10);
  const height = parseInt(options.height, 10);

  const res = await exportVideo({
    templateUrl: options.templateUrl,
    params,
    size: { width, height },
    fps,
    bitrate,
  });

  console.log("Video exported successfully:", res);
} catch (error) {
  console.error("Error exporting video:", error.message);
  process.exit(1);
}
