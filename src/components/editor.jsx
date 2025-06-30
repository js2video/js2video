import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { tags as t } from "@lezer/highlight";
import { draculaInit } from "@uiw/codemirror-theme-dracula";
import { Loader2Icon, RefreshCwIcon, WandSparklesIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn, stringToBase64Url } from "../lib/utils";
import { APIButton } from "./api-button";
import { ExamplesButton } from "./examples-button";
import { useApp } from "./context";

const Editor = ({ templateUrl, iframeRef, onMessageListenerReady }) => {
  const [code, setCode] = useState("");
  const [codePrompt, setCodePrompt] = useState("");
  const [isPrompting, setIsPrompting] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { login, user, isLoadingUser, getAccessToken } = useApp();

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
      if (message.origin !== "null") {
        console.log(
          "Skipping message in parent (origin is not null)",
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

  async function sendCodePrompt() {
    try {
      if (isLoadingUser) {
        return;
      }
      if (!user) {
        login();
        return;
      }
      setIsPrompting(true);
      const token = await getAccessToken();
      const { error, data } = await fetch("/api/ai/template-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: codePrompt,
          code,
        }),
      }).then((res) => res.json());
      if (error) {
        throw error;
      }
      if (!data) {
        throw "No data";
      }
      updateCode(data);
    } catch (err) {
      alert(err?.message ?? err);
    } finally {
      setIsPrompting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="flex px-2 py-2 justify-between items-center bg-black text-white">
        <div className="flex items-center gap-6 pl-1 text-sm font-medium">
          <div>Code</div>
          <ExamplesButton />
        </div>
        <div className="flex items-center gap-6 text-sm">
          <APIButton
            body={{
              templateUrl: stringToBase64Url(code),
              params: {},
            }}
          />
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
      <div className="p-2 py-3 flex gap-3 bg-[#2a2a36]">
        <textarea
          placeholder="Prompt: set bg to black, change font to poppins etc."
          className="rounded px-4 py-2 flex-1 text-sm bg-black text-white focus:outline-none focus:ring-1 focus:ring-[#9999ff]"
          value={codePrompt}
          onChange={(e) => setCodePrompt(e.target.value)}
          rows={1}
        ></textarea>
        <button
          title="Send prompt to AI"
          onClick={sendCodePrompt}
          disabled={isLoadingUser || isPrompting || codePrompt.length < 3}
          className="disabled:opacity-50"
        >
          {isPrompting || isLoadingUser ? (
            <Loader2Icon strokeWidth={1} className="animate-spin" />
          ) : (
            <WandSparklesIcon strokeWidth={1} />
          )}
        </button>
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
