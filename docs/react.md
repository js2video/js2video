# JS2Video React Components

The React component of the JS2Video SDK makes it easy to load a video template with given params. It includes an UI that makes it easy to control playback and export.

## Install

```shell
npm i js2video
```

## Quickstart

Loads a remote video template with params and displays a live preview with playback controls.

```jsx
import { useState } from "react";
import { JS2Video } from "js2video";
// change the path to your node_modules folder
import "/path/to/node_modules/js2video/dist/index.css";

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
      showEditor={false}
    />
  );
};
```
