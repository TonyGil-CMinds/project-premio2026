import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir("C:\\tmp\\premio-measure", { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--remote-debugging-port=9335",
  "--user-data-dir=C:\\tmp\\premio-measure",
  "--window-size=390,844",
  "about:blank",
]);

await sleep(2000);

await fetch("http://127.0.0.1:9335/json/new?" + encodeURIComponent("http://127.0.0.1:3000"));
await sleep(500);
const targets = await fetch("http://127.0.0.1:9335/json").then((r) => r.json());
const page = targets.find((t) => t.type === "page");

let id = 0;
const pending = new Map();
const ws = new WebSocket(page.webSocketDebuggerUrl);

function send(method, params = {}) {
  const mid = ++id;
  ws.send(JSON.stringify({ id: mid, method, params }));
  return new Promise((res, rej) => pending.set(mid, { resolve: res, reject: rej }));
}

ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});

await new Promise((r) => ws.addEventListener("open", r, { once: true }));
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: "http://127.0.0.1:3000" });
await sleep(4500);

const expr = `
  (function() {
    function rect(sel) {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) };
    }
    return JSON.stringify({
      logoStage: rect('.logo-stage'),
      countdown: rect('.countdown-hover-field'),
      heroCopy: rect('.hero-copy'),
      svg: rect('.premio-logo-svg'),
      navShell: rect('.nav-shell')
    });
  })()
`;

const result = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
console.log(JSON.parse(result.result.value));

ws.close();
chrome.kill();
