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
      if (message.origin !== import.meta.env.VITE_PARENT_ORIGIN) {
        console.log(
          "Skipping message from not parent origin:",
          import.meta.env.VITE_PARENT_ORIGIN
        );
        return;
      }
      console.log("set template url", message.data);
      setTemplateUrl(message.data);
    }
    window.addEventListener("message", handleMessage);
    window.parent.postMessage(
      { type: "iframe-ready" },
      import.meta.env.VITE_PARENT_ORIGIN
    );
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
      loop={true}
      enableUnsecureMode={false}
      videoFilePrefix="js2video"
      hideExportButton={true}
    />
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
