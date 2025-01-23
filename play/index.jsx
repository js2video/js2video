import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { JS2Video } from "../src";
import { Loader2Icon, XIcon } from "lucide-react";
import { templates } from "./templates";
import "../index.css";

const EditorHeader = () => {
  const [activeTab, setActiveTab] = useState("");
  if (activeTab === "examples") {
    return (
      <div className="bg-[#282a36] absolute overflow-scroll whitespace-nowrap inset-0 p-2 z-50 mt-[1px] flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="flex text-lg pt-[2px] font-bold">
            Template examples
          </div>
          <button onClick={(e) => setActiveTab(null)}>
            <XIcon size={30} />
          </button>
        </div>
        <div className="text-sm">
          {templates.map((template, index) => (
            <div key={index} className="mb-3">
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
      <div className="flex items-center gap-2 -mb-3 -mx-2">
        <button className="font-medium text-sm border-b pb-2 px-4 border-blue-300">
          Code
        </button>
        <button
          className="font-medium text-sm  pb-2 px-4"
          onClick={(e) => setActiveTab("examples")}
        >
          Examples
        </button>
      </div>
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
            style={{ height: "26px" }}
            src="/images/js2video-logo-dark.svg"
          />
        </div>
        <div className="flex gap-6 items-center text-sm font-medium">
          <a href="/docs/">Docs</a>
          <a href="https://github.com/js2video/js2video" target="_blank">
            <img
              className="invert"
              style={{ height: "28px" }}
              src="/images/github-mark.png"
            />
          </a>
        </div>
      </header>
      <div className="bg-[#222222] text-white flex-1 flex">
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
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
