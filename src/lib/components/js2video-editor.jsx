import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { tags as t } from "@lezer/highlight";
import { draculaInit } from "@uiw/codemirror-theme-dracula";
import { RefreshCwIcon } from "lucide-react";
import { MenuIcon } from "lucide-react";
import { useJS2Video } from "./js2video-provider";
import { useEffect, useState, useRef } from "react";
import { cn, stringToBase64Url } from "../utils";

const JS2VideoEditor = () => {
  const {
    videoTemplate,
    isLoading: isLoadingTemplate,
    setTemplateUrl,
  } = useJS2Video();

  const [code, setCode] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [isLoadingTemplateUrl, setIsLoadingTemplateUrl] = useState(false);

  const isLoading = isLoadingTemplate || isLoadingTemplateUrl;

  useEffect(() => {
    async function load() {
      if (!videoTemplate) {
        return;
      }
      try {
        setIsLoadingTemplateUrl(true);
        const templateCode = await fetch(videoTemplate.templateUrl).then(
          (res) => res.text()
        );
        setCode(templateCode);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingTemplateUrl(false);
      }
    }
    load();
  }, [videoTemplate]);

  async function handleChange(value) {
    setCode(value);
    setIsChanged(true);
  }

  async function updatePreview() {
    const templateUrl = stringToBase64Url(code);
    setIsChanged(false);
    setTemplateUrl(templateUrl);
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-2 flex justify-end items-center bg-black text-white">
        {/* <button>
          <MenuIcon size={22} />
        </button> */}
        <button disabled={!isChanged} onClick={updatePreview}>
          <RefreshCwIcon
            className={cn({
              "opacity-50": !isChanged,
              "animate-spin": isLoading,
            })}
            size={22}
          />
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
            onChange={handleChange}
            height="100%"
            style={{ height: "100%", overscrollBehavior: "contain" }}
          />
        </div>
      </div>
    </div>
  );
};

export { JS2VideoEditor };
