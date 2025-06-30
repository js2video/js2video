import { Modal } from "./modal";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { draculaInit } from "@uiw/codemirror-theme-dracula";
import { useApp } from "./context";

const dracula = draculaInit({
  settings: {
    background: "#282a36",
    foreground: "#f8f8f2",
    fontFamily: "Menlo, monospace",
    fontSize: "0.75rem",
  },
});

const APIButton = ({
  endpoint = "https://js2video.com/api/export-video",
  body = { templateUrl: "https://abc.com", params: {} },
}) => {
  const { user, isLoadingUser } = useApp();

  const jsonPretty = JSON.stringify(body, null, 2);
  const jsonCompact = JSON.stringify(body).replace(/'/g, "\\'");

  const phpBody = JSON.stringify(body, null, 2)
    .replace(/"([^"]+)":/g, "'$1' =>")
    .replace(/"/g, "'");

  const pythonBody = JSON.stringify(body, null, 2)
    .replace(/"([^"]+)":/g, "'$1':")
    .replace(/"/g, "'");

  const examples = [
    {
      label: "Shell (cURL)",
      code: `curl -X POST \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${jsonCompact}' \\
  ${endpoint}`,
      extensions: [],
    },
    {
      label: "Node.js",
      code: `const result = await fetch("${endpoint}", {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${jsonPretty})
}).then(res => res.json());`,
      extensions: [javascript()],
    },
    {
      label: "PHP",
      code: `<?php
$body = json_encode(${phpBody});

$ch = curl_init('${endpoint}');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Authorization: Bearer YOUR_API_KEY',
  'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);`,
      extensions: [php()],
    },
    {
      label: "Python",
      code: `import requests

body = ${pythonBody}

requests.post(
  "${endpoint}",
  headers={
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  json=body
)`,
      extensions: [python()],
    },
  ];

  const exportVideo = async () => {
    if (isLoadingUser || !user) {
      return;
    }
    const { error, data } = await fetch("/api/export-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.apiKey}`,
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
    console.log({ error, data });
  };

  return (
    <Modal>
      <div className="flex flex-col gap-4 text-sm">
        <div className="font-bold text-2xl">Export Video</div>
        <div>
          Use the JS2Video REST API to automate and export this video template
          to MP4.
        </div>
        <a target="_blank" className="underline text-sm" href="/docs/api/">
          API Docs
        </a>

        {
          // @ts-ignore
          import.meta.env.DEV && (
            <div>
              <button onClick={exportVideo}>Export Now</button>
            </div>
          )
        }
        <div className="flex flex-col gap-6 mt-2">
          {examples.map(({ label, code, extensions }) => (
            <div key={label}>
              <h2 className="text-sm mb-2 opacity-60">{label}</h2>
              <CodeMirror
                value={code}
                theme={dracula}
                extensions={extensions}
                readOnly
                basicSetup={{
                  lineNumbers: false,
                  highlightActiveLine: false,
                  highlightSelectionMatches: false,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <button className="opacity-50 hover:opacity-80">Export / API</button>
    </Modal>
  );
};

export { APIButton };
