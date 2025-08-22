import ReactDOM from "react-dom/client";
import "../index.css";
import { JS2Video } from "../src";
import { useState, useEffect } from "react";
import { Loader2Icon } from "lucide-react";

const App = () => {
  const [templateUrl, setTemplateUrl] = useState(null);

  useEffect(() => {
    function handleMessage(message) {
      console.log("Received message in iframe:", message);
      if (message.origin !== window.location.origin) {
        console.log("Ignored message from other origin:", message.origin);
        return;
      }
      if (!message.data) return;
      setTemplateUrl(message.data);
    }
    window.addEventListener("message", handleMessage);
    // notify parent that iframe is ready
    window.parent.postMessage({ type: "iframe-ready" }, "*");
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!templateUrl) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  return (
    <JS2Video
      templateUrl={templateUrl}
      params={{}}
      autoPlay={false}
      loop
      enableUnsecureMode={false}
      videoFilePrefix="js2video"
      controlsClassName="border-t border-[#666] bg-black text-white"
    />
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
