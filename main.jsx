import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { JS2Video } from "./src";
import "./index.css";

const App = () => {
  const [templateUrl, setTemplateUrl] = useState(
    location.origin + "/template.js"
  );

  const [params, setParams] = useState({
    text: "Welcome to JS2Video",
    fontFamily: "Oswald",
  });

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
              body: JSON.stringify({ templateUrl, params }),
            }).then((res) => res.json());
            console.log(JSON.stringify(result));
            alert("Exported!");
          }}
        >
          Export
        </button>
      </div>
      <JS2Video
        templateUrl={templateUrl}
        params={params}
        autoPlay={true}
        loop={true}
        enableUnsecureMode={true}
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
