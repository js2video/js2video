export async function onRequest({ request }) {
  // Strip the `/api` prefix from the incoming path
  const incoming = new URL(request.url);
  const forwardPath = incoming.pathname.replace(/^\/api\/?/, "");
  // build your target URL
  const targetUrl = `https://perium-repo.onrender.com/${forwardPath}${incoming.search}`;

  // Proxy the request (headers, body, method all forwarded)
  const proxyReq = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
    redirect: "manual",
  });

  return fetch(proxyReq);
}
