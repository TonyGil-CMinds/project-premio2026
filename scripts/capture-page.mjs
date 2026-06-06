import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const url = process.argv[2] ?? "http://127.0.0.1:3000";
const output = process.argv[3] ?? "premio-hero-desktop.png";
const width = Number(process.argv[4] ?? 1728);
const height = Number(process.argv[5] ?? 1117);
const port = Number(process.argv[6] ?? 9333);

const userDataDir = join("C:\\tmp", `premio-chrome-${port}`);
await mkdir(userDataDir, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  `--window-size=${width},${height}`,
  "about:blank",
]);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDebuggerUrl() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`);
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      await sleep(150);
    }
  }

  throw new Error("Chrome debugging endpoint did not start.");
}

let id = 0;
const pending = new Map();
const socket = new WebSocket(await getDebuggerUrl());

function send(method, params = {}) {
  const messageId = (id += 1);
  socket.send(JSON.stringify({ id: messageId, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(messageId, { resolve, reject });
  });
}

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 700,
});
await send("Page.navigate", { url });
await sleep(4200);

const overlay = await send("Runtime.evaluate", {
  expression:
    'document.querySelector("[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay") ? "ERROR_OVERLAY" : "OK"',
  returnByValue: true,
});
const content = await send("Runtime.evaluate", {
  expression: 'document.body.innerText.trim().length > 0 ? "HAS_CONTENT" : "BLANK"',
  returnByValue: true,
});
const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });

await writeFile(output, Buffer.from(screenshot.data, "base64"));
console.log(JSON.stringify({ overlay: overlay.result.value, content: content.result.value, output }, null, 2));

socket.close();
chrome.kill();
