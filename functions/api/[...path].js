export async function onRequest({ request, params }) {
  const path = params.path.join("/");
  const targetUrl = `https://perium-repo.onrender.com/${path}`;
  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
    redirect: "manual",
  });
  return fetch(proxyRequest);
}
