import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { JS2Video } from "../src";
import { Loader2Icon, XIcon, MenuIcon, ChevronDownIcon } from "lucide-react";
import "../index.css";

const templates = [
  {
    group: "Audio",
    items: [
      {
        label: "Audio with waveform bars",
        url: "/templates/audio-waveform-bars.js",
      },
    ],
  },
  {
    group: "Image",
    items: [
      {
        label: "Background image with text overlay",
        url: "/templates/bg-image.js",
      },
    ],
  },
  {
    group: "Text",
    items: [
      { label: "Typewriter effect", url: "/templates/typewriter.js" },
      { label: "Display a counter", url: "/templates/counter.js" },
      { label: "Animate separate characters", url: "/templates/chars.js" },
      { label: "Load custom font by URL", url: "/templates/custom-font.js" },
      { label: "Load Google font by name", url: "/templates/google-font.js" },
    ],
  },
  {
    group: "Video",
    items: [
      {
        label: "Background video with text overlay",
        url: "/templates/video-overlay.js",
      },
    ],
  },
  {
    group: "Lottie",
    items: [
      {
        label: "Lottie emoji",
        url: "/templates/lottie-emoji.js",
      },
    ],
  },
  {
    group: "SVG",
    items: [
      {
        label: "Load SVG from string",
        url: "/templates/svg-string.js",
      },
    ],
  },
];

const EditorHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  if (isOpen) {
    return (
      <div className="bg-black absolute inset-0 p-2 z-50 mt-[1px] flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="flex text-sm opacity-50 pt-[2px]">Examples</div>
          <button onClick={(e) => setIsOpen(false)}>
            <XIcon />
          </button>
        </div>
        <div className="p-2 text-sm">
          {templates.map((template, index) => (
            <div key={index} className="mb-6">
              <h2 className="mb-2 opacity-60">{template.group}</h2>
              <ul className="list-disc flex flex-col gap-2 pl-6">
                {template.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a href={"/play/?t=" + location.origin + item.url}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <button
        className="flex items-end gap-1 font-medium text-sm"
        onClick={(e) => setIsOpen(true)}
      >
        Examples <ChevronDownIcon size={18} />
      </button>
    );
  }
};

const App = () => {
  const [templateUrl, setTemplateUrl] = useState("");
  const [params, setParams] = useState({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tParam = urlParams.get("t");
    setTemplateUrl(tParam ?? location.origin + "/templates/hello-world.js");
  }, []);

  if (!templateUrl) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col max-w-screen-2xl w-full mx-auto">
      <header className="p-3 bg-black border-b border-gray-600 text-white flex justify-between items-center">
        <div className="flex items-center">
          <img
            style={{ height: "30px" }}
            src="/images/js2video-logo-dark.svg"
          />
          <sup className="opacity-50">Alpha</sup>
        </div>
        <div className="flex gap-4">
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
        EditorHeader={EditorHeader}
        showEditor={true}
        autoPlay={false}
        loop={true}
        enableUnsecureMode={true}
        videoFilePrefix="js2video"
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
