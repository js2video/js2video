import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Loader2Icon, XIcon } from "lucide-react";
import { templates } from "./templates";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Editor } from "../src/components/editor";
import { AppProvider } from "../src/components/context";
import { Profile } from "../src/components/profile";
import "../index.css";

const App = () => {
  const [displayIframe, setDisplayIframe] = useState(false);
  const [templateUrl, setTemplateUrl] = useState("");
  const iframeRef = useRef();

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
      <header className="p-3 border-b border-[#666] text-white flex justify-between items-center">
        <a href="/">
          <img
            style={{ height: "26px" }}
            src="/images/js2video-logo-dark.svg"
          />
        </a>
        <div className="flex gap-6 items-center text-sm font-medium">
          <a href="/docs/">Docs</a>
          <a href="https://github.com/js2video/js2video" target="_blank">
            <img
              className="invert"
              style={{ height: "28px" }}
              src="/images/github-mark.png"
            />
          </a>
          <Profile />
        </div>
      </header>
      <div className="text-white flex-1 flex">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={30} className="flex border-r border-[#666]">
            <Editor
              templates={templates}
              iframeRef={iframeRef}
              templateUrl={templateUrl}
              onMessageListenerReady={() => setDisplayIframe(true)}
            />
          </Panel>
          <PanelResizeHandle />
          <Panel className="flex flex-col">
            {displayIframe && (
              <iframe
                ref={iframeRef}
                sandbox="allow-scripts"
                src="/iframe/"
                className="flex-1"
              />
            )}
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(
  <AppProvider>
    <App />
  </AppProvider>
);
