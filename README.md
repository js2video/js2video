# JS2Video

> [!CAUTION]  
> Work in progress. Do not use this library in production yet! Breaking changes will happen.

JS2Video is a powerful JavaScript library that allows you to create video content directly from JavaScript code. It enables you to programmatically create templated videos and export them as MP4 files both in the browser and on the server.

## Links

- Homepage: [js2video.com](https://js2video.com)
- Playground: [js2video.com/play/](https://js2video.com/play/)
- Repository: [github.com/js2video/js2video](https://github.com/js2video/js2video)
- Author: [github.com/pkl](https://github.com/pkl)

## License

You are free to copy, modify, and distribute JS2Video with attribution under the terms of the MIT license. See the LICENSE file for details.

## Usage

### Install

JS2Video is available on npm under the name "js2video." Both server and client code are included in the same package.

```shell
npm i js2video
```

### Vanilla JS

```js
import { VideoTemplate } from "js2video";

let vt;

addEventListener("DOMContentLoaded", async () => {
  if (vt) {
    await vt.dispose();
  }
  vt = new VideoTemplate({
    templateUrl: "https://js2video.com/templates/hello-world.js",
    params: { name: "World" },
    enableUnsecureMode: true,
    autoPlay: true,
    loop: true,
    parentElement: document.body,
  });
  await vt.load();
});
```

### React

```jsx
import { useState } from "react";
import { JS2Video } from "js2video";
import "/node_modules/js2video/dist/index.css";

const App = () => {
  const [templateUrl, setTemplateUrl] = useState(
    "https://js2video.com/templates/hello-world.js"
  );

  const [params, setParams] = useState({ name: "World" });

  return (
    <JS2Video
      templateUrl={templateUrl}
      params={params}
      autoPlay={false}
      loop={true}
      enableUnsecureMode={true}
    />
  );
};
```

### Node.js

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

Note: Due its size _puppeteer_ is a peer dependecy and must be installed separately in your project.

```shell
npm i puppeteer
```

## Video Templates

Visit the JS2Video Playground to edit, preview and export video templates in real time

https://js2video.com/play
