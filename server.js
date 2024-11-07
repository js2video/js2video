import http from "http";
import { exportVideo } from "./src/lib/export-video.js";

const parseJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const json = JSON.parse(body);
        resolve(json);
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
};

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  console.log(req.method, req.url);

  if (req.method === "POST") {
    try {
      const options = await parseJsonBody(req);
      const result = await exportVideo(options);
      console.log(result);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err }));
    }
  } else {
    res.writeHead(204);
    res.end();
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Node server running on http://localhost:${PORT}`);
});
