# JS2Video in Vanilla JS

The JS2Video library can be used without a framework like React.

The exported "VideoTemplate" class is loaded with a video template URL and controlled from JavaScript.

## Install

```shell
npm i js2video
```

## Quickstart

Loads a remote video template with params and renders a preview. Playback/export can be controlled with the videoTemplate instance methods.

```js
import { VideoTemplate } from "js2video";

let vt;

addEventListener("DOMContentLoaded", async () => {
  if (vt) {
    // dispose the resources loaded in this instance
    // before loading a new.
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

You can now control the loaded template like this:

```js
vt.play();
vt.pause();
await vt.seek({ time: 2 });
await vt.rewind();
vt.scrub({ progress: 0.2 });
```

[Typedocs for VideoTemplate](https://js2video.com/typedocs/classes/index.VideoTemplate)
