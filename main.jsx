import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { JS2Video } from "./src";

const App = () => {
  const [templateUrl, setTemplateUrl] = useState(
    location.origin + "/template.js"
  );
  const [params, setParams] = useState({
    text: "Welcome to JS2Video",
    fontFamily: "Oswald",
  });
  const [size, setSize] = useState({ width: 1920, height: 1080 });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px" }}>JS2Video</div>
      <div>
        <button
          onClick={(e) => {
            setParams({ text: "New Params!", fontFamily: "Impact" });
          }}
        >
          Update params
        </button>
        <button
          onClick={async (e) => {
            const result = await fetch("http://localhost:3001", {
              method: "POST",
              body: JSON.stringify({ templateUrl, params, size }),
            }).then((res) => res.json());
            console.log(result);
            alert("Exported!");
          }}
        >
          Export
        </button>
      </div>
      <JS2Video
        templateUrl={templateUrl}
        params={params}
        size={size}
        autoPlay={true}
        loop={true}
        enableUnsecureMode={true}
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
