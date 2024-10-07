import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { JS2Video, Preview } from "./index.react";

const App = () => {
  const [templateUrl, setTemplateUrl] = useState(`../../assets/template.js`);
  const [params, setParams] = useState({
    text: "Hello From React!",
    fontFamily: "Oswald",
  });
  const [size, setSize] = useState({ width: 1920, height: 1080 });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px" }}>JS2Video</div>
      <JS2Video
        templateUrl={templateUrl}
        params={params}
        size={size}
        autoPlay={true}
        loop={true}
        yolo={true}
      >
        <Preview />
      </JS2Video>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
