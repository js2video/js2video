export async function onRequest({ request }) {
  const url = new URL(request.url);

  // 1) Split the path into segments, dropping any empty strings:
  //    "/api/foo/bar"    → ["api","foo","bar"]
  //    "/api/"           → ["api"]
  //    "/"               → []
  const segments = url.pathname.split("/").filter(Boolean);

  // 2) Remove the first segment *only if* it is "api"
  if (segments[0] === "api") {
    segments.shift();
  }

  // 3) Rebuild the forward path, ensuring it starts with "/"
  //    []      → ""      → "/"
  //    ["ai"]  → "ai"    → "/ai"
  //    ["a","b"] → "a/b" → "/a/b"
  const forwardPath = "/" + segments.join("/");
  const targetUrl = `https://js2video-server.onrender.com${forwardPath}${url.search}`;

  const proxyReq = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
    redirect: "manual",
  });

  return fetch(proxyReq);
}
