import ReactDOM from "react-dom/client";
import "../index.css";
import { JS2Video } from "../src";
import { useState, useEffect } from "react";
import { Loader2Icon } from "lucide-react";

const App = () => {
  const [templateUrl, setTemplateUrl] = useState(null);

  useEffect(() => {
    function handleMessage(event) {
      if (event.origin !== location.origin) {
        console.log("bad origin");
        return;
      }
      setTemplateUrl(event.data);
    }
    window.addEventListener("message", handleMessage);
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
      loop={true}
      enableUnsecureMode={false}
      videoFilePrefix="js2video"
      hideExportButton={true}
    />
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
