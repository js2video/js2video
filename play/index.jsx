import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { JS2Video } from "../src";
import "../index.css";

const App = () => {
  const [templateUrl, setTemplateUrl] = useState(
    location.origin + "/template.js"
  );

  const [params, setParams] = useState({});

  return (
    <div className="h-screen flex flex-col">
      <header className="p-3 bg-black border-b border-gray-600 text-white flex justify-between items-center">
        <div className="flex items-center">
          <a href="/">
            <img
              style={{ height: "30px" }}
              src="/images/js2video-logo-dark.svg"
            />
          </a>
          <div className="opacity-50">Play</div>
        </div>
        <div className="flex gap-4">
          <a href="/docs">Docs</a>
          <a href="https://github.com/js2video/js2video" target="_blank">
            <img
              className="invert"
              style={{ height: "26px" }}
              src="/images/github-mark.png"
            />
          </a>
        </div>
      </header>
      <JS2Video
        templateUrl={templateUrl}
        params={params}
        autoPlay={false}
        loop={true}
        enableUnsecureMode={true}
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
