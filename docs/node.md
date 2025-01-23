# JS2Video in Node.js

Videos can be exported from Node.js using puppeteer under the hood.

## Install

```shell
npm i js2video
```

Due its size _puppeteer_ is a peer dependecy and must be installed separately in your project before you can render videos on the server.

```shell
npm i puppeteer
```

## Quickstart

Loads a remote video template with params and exports it to MP4 on the server.

```js
import { exportVideo } from "js2video/server";

await exportVideo({
  templateUrl: "https://js2video.com/templates/hello-world.js",
  params: {
    name: "World",
    bitrate: 10_000_000,
    size: {
      width: 1920,
      height: 1080,
    },
  },
});
```
