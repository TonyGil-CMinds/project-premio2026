import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const url = process.argv[2] ?? "http://127.0.0.1:3000";
const expression = process.argv[3] ?? "document.body.innerText";
const width = Number(process.argv[4] ?? 1920);
const height = Number(process.argv[5] ?? 900);
const port = Number(process.argv[6] ?? 9360);
const userDataDir = join("C:\\tmp", `premio-inspect-${port}`);
await mkdir(userDataDir, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  `--window-size=${width},${height}`,
  "about:blank",
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getDebuggerUrl() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`);
      const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
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
  return new Promise((resolve, reject) => pending.set(messageId, { resolve, reject }));
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
await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 });
await send("Page.navigate", { url });
await sleep(5000);
// Pre-scroll to let ScrollTrigger update before running the main expression
const scrollY = Number(process.argv[7] ?? 0);
if (scrollY > 0) {
  await send("Runtime.evaluate", {
    expression: `window.__lenis ? window.__lenis.scrollTo(${scrollY},{immediate:true}) : window.scrollTo(0,${scrollY})`,
    returnByValue: true,
  });
  await sleep(2000);
}
const result = await send("Runtime.evaluate", { expression, returnByValue: true });
console.log(JSON.stringify(result.result.value, null, 2));
// Optional screenshot arg (argv[8])
const screenshotPath = process.argv[8];
if (screenshotPath) {
  const { writeFile } = await import("node:fs/promises");
  const ss = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(screenshotPath, Buffer.from(ss.data, "base64"));
}
socket.close();
chrome.kill();
