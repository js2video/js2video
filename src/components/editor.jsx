import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { tags as t } from "@lezer/highlight";
import { draculaInit } from "@uiw/codemirror-theme-dracula";
import { RefreshCwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn, stringToBase64Url } from "../lib/utils";
import { ExamplesButton } from "./examples-button";

const Editor = ({ templateUrl, iframeRef, onMessageListenerReady }) => {
  const [code, setCode] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isChanged) {
        const message = "Leave this page and start over?";
        e.returnValue = message;
        return message;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isChanged]);

  useEffect(() => {
    function handleMessage(message) {
      console.log("Received message in parent:", message);

      // only accept messages from same origin
      if (message.origin !== "null") {
        console.log(
          "Skipping message in parent (wrong origin)",
          message.origin
        );
        return;
      }

      if (message.data?.type === "iframe-ready") {
        setIsIframeReady(true);
      }
    }

    window.addEventListener("message", handleMessage);
    onMessageListenerReady();

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    async function load() {
      if (!isIframeReady) {
        return;
      }
      try {
        setIsLoading(true);
        const templateCode = await fetch(templateUrl).then((res) => res.text());
        updateCode(templateCode);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isIframeReady, templateUrl]);

  // preview code and mark as unchanged
  function updateCode(newCode) {
    setCode(newCode);
    setIsChanged(false);
    iframeRef?.current?.contentWindow?.postMessage(
      stringToBase64Url(newCode),
      "*"
    );
  }

  async function handleCodeChange(value) {
    setCode(value);
    setIsChanged(true);
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="flex px-2 py-2 justify-between items-center bg-black text-white">
        <div className="flex items-center gap-6 pl-1 text-sm font-medium">
          <div>Code</div>
          <ExamplesButton />
        </div>
        <div className="flex items-center gap-6 text-sm">
          <button
            title="Update preview"
            disabled={!isChanged}
            onClick={() => updateCode(code)}
          >
            <RefreshCwIcon
              className={cn({
                "opacity-50": !isChanged,
                "animate-spin": isLoading,
              })}
              size={26}
              strokeWidth={1}
            />
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <CodeMirror
            readOnly={isLoading}
            value={code}
            theme={draculaInit({
              settings: {
                caret: "#c6c6c6",
                fontFamily: "monospace",
              },
              styles: [{ tag: t.comment, color: "#6272a4" }],
            })}
            extensions={[javascript({ jsx: false, typescript: false })]}
            onChange={handleCodeChange}
            height="100%"
            style={{ height: "100%", overscrollBehavior: "contain" }}
          />
        </div>
      </div>
    </div>
  );
};

export { Editor };
