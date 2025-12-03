import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Loader2Icon } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Editor } from "../src/components/editor";
import { JS2Video } from "../src";
import "../index.css";

const App = () => {
  const [templateUrl, setTemplateUrl] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tParam = urlParams.get("t");
    setTemplateUrl(tParam ?? location.origin + "/templates/hello-world.js");
  }, []);

  if (!templateUrl) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-screen w-full flex-col">
      <header className="flex items-center justify-between border-b border-[#666] p-3 text-white">
        <a href="/">
          <img
            style={{ height: "26px" }}
            src="/images/js2video-logo-dark.svg"
          />
        </a>
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="/docs/" target="_blank">
            Docs
          </a>
          <a href="https://github.com/js2video/js2video" target="_blank">
            <img
              className="invert"
              style={{ height: "28px" }}
              src="/images/github-mark.png"
            />
          </a>
        </div>
      </header>
      <div className="flex flex-1 text-white">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={30} className="flex border-r border-[#666]">
            <Editor templateUrl={templateUrl} setTemplateUrl={setTemplateUrl} />
          </Panel>
          <PanelResizeHandle />
          <Panel className="flex flex-col">
            <JS2Video
              templateUrl={templateUrl}
              params={{}}
              autoPlay={false}
              loop
              enableUnsecureMode={true}
              videoFilePrefix="js2video"
              controlsClassName="border-t border-gray-700 bg-black text-gray-300"
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
