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
    <div className="h-screen flex flex-col">
      <header className="p-3 bg-black border-b border-gray-600 text-white flex justify-between items-center">
        <div>
          JS2Video <span className="font-extrabold text-pink-500">PLAY</span>
        </div>
        <div className="flex gap-4">
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
      </header>
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
